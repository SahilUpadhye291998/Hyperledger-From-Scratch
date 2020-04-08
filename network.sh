#!/bin/bash

function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

function generateCerts(){
    which cryptogen
    if [ "$?" -ne 0 ]; then
        echo "cryptogen tool not found. exiting"
        exit 1
    fi
    echo
    echo "##########################################################"
    echo "##### Generate certificates using cryptogen tool #########"
    echo "##########################################################"

    if [ -d "crypto-config" ]; then
        rm -Rf crypto-config
    fi
    set -x
    cryptogen generate --config=./crypto-config.yaml
    res=$?
    set +x
    if [ $res -ne 0 ]; then
        echo "Failed to generate certificates..."
        exit 1
    fi
    echo
    echo "Generate CCP files for Org1 and Org2"
    ./ccp-generate.sh
}

function replacePrivateKey(){
    # sed on MacOSX does not support -i flag with a null extension. We will use
    # 't' for our back-up's extension and delete it at the end of the function
    ARCH=$(uname -s | grep Darwin)
    if [ "$ARCH" == "Darwin" ]; then
        OPTS="-it"
    else
        OPTS="-i"
    fi

    # Copy the template to the file that will be modified to add the private key
    sudo cp docker-compose-e2e-template.yaml docker-compose-e2e.yaml

    # The next steps will replace the template's contents with the
    # actual values of the private key file names for the two CAs.
    CURRENT_DIR=$PWD
    cd crypto-config/peerOrganizations/org1.example.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd "$CURRENT_DIR"
    sudo sed $OPTS "s/CA1_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-e2e.yaml
    cd crypto-config/peerOrganizations/org2.example.com/ca/
    PRIV_KEY=$(ls *_sk)
    cd "$CURRENT_DIR"
    sed $OPTS "s/CA2_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-e2e.yaml
    # If MacOSX, remove the temporary backup of the docker-compose file
    if [ "$ARCH" == "Darwin" ]; then
        rm docker-compose-e2e.yamlt
    fi
}

function generateChannelArtifacts(){
      which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi

  echo "##########################################################"
  echo "#########  Generating Orderer Genesis block ##############"
  echo "##########################################################"
  # Note: For some unknown reason (at least for now) the block file can't be
  # named orderer.genesis.block or the orderer will fail to launch!
  echo "CONSENSUS_TYPE="$CONSENSUS_TYPE
  set -x
  if [ "$CONSENSUS_TYPE" == "solo" ]; then
    configtxgen -profile TwoOrgsOrdererGenesis -channelID $SYS_CHANNEL -outputBlock ./channel-artifacts/genesis.block
  else
    set +x
    echo "unrecognized CONSESUS_TYPE='$CONSENSUS_TYPE'. exiting"
    exit 1
  fi
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
  fi
  echo
  echo "#################################################################"
  echo "### Generating channel configuration transaction 'channel.tx' ###"
  echo "#################################################################"
  set -x
  configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi

  echo
  echo "#################################################################"
  echo "#######    Generating anchor peer update for Org1MSP   ##########"
  echo "#################################################################"
  set -x
  configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org1MSP..."
    exit 1
  fi

  echo
  echo "#################################################################"
  echo "#######    Generating anchor peer update for Org2MSP   ##########"
  echo "#################################################################"
  set -x
  configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate anchor peer update for Org2MSP..."
    exit 1
  fi
  echo
}

function networkUp(){
    if [ ! -d "crypto-config" ]; then
        generateCerts
        replacePrivateKey
        generateChannelArtifacts
    fi
    if [ "${CERTIFICATE_AUTHORITIES}" == "true" ]; then
      export BYFN_CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)
      export BYFN_CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk)
      docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml -f docker-compose-e2e.yaml up -d
      docker ps
      docker exec cli /bin/sh -c "scripts/networkUp_insurance.sh"
      docker exec cli /bin/sh -c "scripts/testChaincode_insurance.sh"
    else
      docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml up -d
      docker ps
      docker exec cli /bin/sh -c "scripts/networkUp_insurance.sh"
      docker exec cli /bin/sh -c "scripts/testChaincode_insurance.sh"
    fi
}

function networkDown() {
  docker-compose -f $COMPOSE_FILE  down --volumes --remove-orphans

  if [ "$MODE" != "restart" ]; then
    docker run -v $PWD:/tmp/first-network --rm hyperledger/fabric-tools:$IMAGETAG rm -Rf /tmp/first-network/ledgers-backup
    clearContainers
    removeUnwantedImages
    rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config ./org3-artifacts/crypto-config/ channel-artifacts/org3.json
    rm -f docker-compose-e2e.yaml
    docker volume prune
  fi

}

CONSENSUS_TYPE="solo"
CLI_TIMEOUT=100
CLI_DELAY=30
SYS_CHANNEL="insurance-sys-channel"
CERTIFICATE_AUTHORITIES=true
CHANNEL_NAME="mychannel"
LANGUAGE=javascript
export VERBOSE=true
NO_CHAINCODE=false
COMPOSE_FILE=docker-compose-cli.yaml
COMPOSE_FILE_COUCH=docker-compose-couch.yaml
IF_COUCHDB=couchdb
COMPOSE_FILE_CA=docker-compose-ca.yaml
IMAGETAG="latest"
export $IMAGETAG="latest"

MODE=$1
shift
if [ "$MODE" == "generate" ]; then
    echo "#################################################################"
    echo "####################    Generate PreReq   #######################"
    echo "#################################################################"
    generateCerts
    replacePrivateKey
    generateChannelArtifacts
elif [ "$MODE" == "up" ]; then
    networkUp
elif [ "$MODE" == "down" ]; then
    networkDown
else
    echo "Please use generate"
    exit 1
fi
