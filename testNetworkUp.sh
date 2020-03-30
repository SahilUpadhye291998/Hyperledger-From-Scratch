echo "======================================================"
docker-compose -f docker-compose-cli.yaml up -d
echo "======================================================"
docker ps
echo "======================================================"

docker exec cli /bin/sh -c "scripts/networkUp.sh"

echo "*****************************************************"
echo "testing chaincode"
echo "*****************************************************"

docker exec cli /bin/sh -c "scripts/testChaincode.sh"
