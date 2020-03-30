echo "************************************************************************"
echo "************************************************************************"
echo "************************Instantiate Chaincode***************************"
echo "************************************************************************"
echo "************************************************************************"

echo "==================channel instaiate Org1 and Org2====================="
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc -l node -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"
echo "====================================================="

sleep 3

echo "==================channel Query ====================="
peer chaincode query -C mychannel -n mycc -c '{"Args":["query","a"]}'
echo "====================================================="

sleep 3

echo "==================channel invoke for peer0.org1 to peer0.org2====================="
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["invoke","a","b","10"]}'
echo "====================================================="

sleep 3

echo "==================channel Query ====================="
peer chaincode query -C mychannel -n mycc -c '{"Args":["query","a"]}'
echo "====================================================="
