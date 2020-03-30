echo "************************************************************************"
echo "************************************************************************"
echo "************************Instantiate Chaincode***************************"
echo "************************************************************************"
echo "************************************************************************"

echo "==================channel instaiate Org1 and Org2====================="
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc -l node -v 1.0 -c '{"Args":["init"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
echo "====================================================="

sleep 3
# ==== Invoke marbles ====
echo "Sleeping 3 sec"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["initMarble","marble1","blue","35","tom"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt  -c '{"Args":["initMarble","marble2","red","50","tom"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt  -c '{"Args":["initMarble","marble3","blue","70","tom"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt  -c '{"Args":["transferMarble","marble2","jerry"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt  -c '{"Args":["transferMarblesBasedOnColor","blue","jerry"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt  -c '{"Args":["delete","marble1"]}'
# #==== Query marbles ====
sleep 3
echo "Sleeping 3 sec"
peer chaincode query -C mychannel -n mycc -c  '{"Args":["readMarble","marble1"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode query  -C mychannel -n mycc -c  '{"Args":["getMarblesByRange","marble1","marble3"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode query  -C mychannel -n mycc -c  '{"Args":["getHistoryForMarble","marble1"]}'
sleep 3
echo "Sleeping 3 sec"
peer chaincode query  -C mychannel -n mycc -c  '{"Args":["getMarblesByRangeWithPagination","marble1","marble3","3",""]}'
# #Rich Query (Only supported if CouchDB is used as state database):
echo "Sleeping 3 sec"
sleep 3
peer chaincode query  -C mychannel -n mycc -c  '{"Args":["queryMarblesByOwner","tom"]}'
echo "Sleeping 3 sec"
sleep 3
echo "Sleeping 3 sec"
peer chaincode query -C mychannel -n mycc -c '{"Args":["queryMarbles","{\"selector\":{\"owner\":\"tom\"}}"]}'

#Rich Query with Pagination (Only supported if CouchDB is used as state database):
sleep 3
peer chaincode query -C mychannel -n mycc -c  '{"Args":["queryMarblesWithPagination","{\"selector\":{\"owner\":\"tom\"}}","3",""]}'