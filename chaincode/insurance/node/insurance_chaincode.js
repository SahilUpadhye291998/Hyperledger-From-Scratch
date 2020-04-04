// see how we can transfer the amount from the user to company
// i see the code to be written would be more appropriate if written on comany side
'use strict';
const shim = require('fabric-shim');
const util = require('util');


let Chaincode = class {
    async Init(stub) {
        const ret = stub.getFunctionAndParameters();
        console.info(ret);
        console.info("Sample Chaincode is initalized");
        return shim.success();
    }

    async Invoke(stub) {
        console.info(`Transaction ID is ${stub.getTxID()}`);
        console.info(util.format(`Args ${stub.getArgs()}`));
        const ret = stub.getFunctionAndParameters();
        console.info(ret);
        const method = this[ret.fcn];
        if (!method) {
            console.info(`Received unknow ${ret.fcn} invocation`);
            throw new Error(`Received unknow ${ret.fcn} invocation`);
        }
        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (error) {
            console.log(error);
            return shim.error(error);
        }
    }

    async initUser(stub, args, thisClass) {
        if (args.length != 5) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }
        console.info('--- start init users ---')
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4th argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5th argument must be a non-empty string');
        }
        let userName = args[0];
        let userAddress = args[1];
        let userMobile = args[3];
        let userSecret = args[4];
        let userAmount = parseInt(args[2]);
        if (typeof userAmount !== 'number') {
            throw new Error(`3rd argument should be a numeric type`);
        }

        let userState = await stub.getState(userName);
        if (userState.toString()) {
            throw new Error(`User already exists`);
        }

        let user = {};
        user.docType = 'user';
        user.name = userName;
        user.mobile = userMobile;
        user.address = userAddress;
        user.secret = userSecret;
        user.amount = userAmount;
        user.premiumAmount = userAmount;

        await stub.putState(userName, Buffer.from(JSON.stringify(user)));

        let indexName = `secret~name`;
        let secretNameIndexKey = await stub.createCompositeKey(indexName, [user.secret, user.name]);
        console.log(secretNameIndexKey);

        await stub.putState(secretNameIndexKey, Buffer.from('\u0000'));
        console.info("end of initialzation");
    }

    async readUser(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the marble to query');
        }

        let argUser = args[0];
        if (!argUser) {
            throw new Error(`Mobile number cant be blank`);
        }

        let user = await stub.getState(argUser);
        if (!user) {
            let jsonResponce = {};
            jsonResponce.Error = `Unable to find user with given phone number`;
            throw new Error(JSON.stringify(jsonResponce));
        }

        console.log("=====================================================================");
        console.log(user.toString());
        console.log("=====================================================================");
        return user;
    }


    async deleteUser(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the marble to delete');
        }

        let userArg = args[0];
        if (!userArg) {
            throw new Error(`Mobile number cant be left blank`);
        }

        let user = await stub.getState(userArg);
        if (!user) {
            throw Error(`Cannot find the user this is mobile number`);
        }

        let userJSON = {};
        try {
            userJSON = JSON.parse(user.toString());
        } catch (error) {
            let jsonError = {};
            jsonError.Error = `Unable to decode json of ${mobile}`;
            throw new Error(JSON.stringify(jsonError));
        }

        await stub.deleteState(userArg);

        const indexName = `secret~name`;
        let secretNameIndexKey = stub.createCompositeKey(indexName, [userJSON.secret, userJSON.name]);
        if (!secretNameIndexKey) {
            throw new Error(`Failed to create a composite key`);
        }
         
        console.log(`OK`);
        await stub.deleteState(secretNameIndexKey);
    }

    async queryUserByOwner(stub, args, thisClass) {
        //   0
        // 'bob'
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting owner name.');
        }

        let owner = args[0];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'user';
        queryString.selector.name = owner;
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);
        return queryResults; //shim.success(queryResults);
    }

    async queryUserByOwnerAndPassword(stub, args, thisClass) {
        //   0
        // 'bob'
        if (args.length < 2) {
            throw new Error('Incorrect number of arguments. Expecting owner name.')
        }

        let owner = args[0];
        let password = args[1];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'user';
        queryString.selector.name = owner;
        queryString.selector.secret= password;
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);
        return queryResults; //shim.success(queryResults);
    }

    async payPremiumByUserName(stub, args, thisClass){
        if(args.length != 3){
            throw new Error(`Invalid number of arguments. please enter 2 argument`);
        }

        var argsCompany = args[2];
        var argsName = args[0];
        var argsAmount = parseInt(args[1]);
        if(typeof argsAmount !== 'number'){
            throw new Exception(`please enter an integer argument in the string`);
        }

        let userAsBytes = await stub.getState(argsName);
        if(!userAsBytes.toString()){
            throw new Exception(`${argsName} user not found`);
        }
        
        let user= {};
        try {
            user= JSON.parse(userAsBytes.toString());
        } catch (error) {
            let jsonError = {};
            jsonError.Error = `Unable to decode json of ${argsName}`;
            throw new Error(JSON.stringify(jsonError));
        }
        
        let companyAsBytes = await stub.getState(argsCompany);
        if(!companyAsBytes.toString()){
            throw new Exception(`${argsName} user not found`);
        }
        
        let company= {};
        try {
            company= JSON.parse(companyAsBytes.toString());
        } catch (error) {
            let jsonError = {};
            jsonError.Error = `Unable to decode json of ${argsName}`;
            throw new Error(JSON.stringify(jsonError));
        }

        user.premiumAmount += argsAmount;
        company.totalAmount += argsAmount;
        
        await stub.putState(argsName, Buffer.from(JSON.stringify(user)));
        await stub.putState(argsCompany, Buffer.from(JSON.stringify(user)));

        const indexKey = `secret~name`;

        let secretNameIndexKey = await stub.createCompositeKey(indexKey,[user.secret,user.name]);
        if(!secretNameIndexKey){
            throw new Exception(`Failed to generate index key`);
        }
        await stub.putState(secretNameIndexKey,Buffer.from('\u0000'));
        
        secretNameIndexKey = await stub.createCompositeKey(indexKey,[company.secret,company.name]);
        if(!secretNameIndexKey){
            throw new Exception(`Failed to generate index key`);
        }

        await stub.putState(secretNameIndexKey,Buffer.from('\u0000'));
    }
    
    async getHistoryForUser(stub, args, thisClass) {

        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting 1')
        }
        let userName = args[0];
        console.info('- start getHistoryForMarble: %s\n', userName);

        let resultsIterator = await stub.getHistoryForKey(userName);
        let method = thisClass['getAllResults'];
        let results = await method(resultsIterator, true);

        return Buffer.from(JSON.stringify(results));
    }

    async getQueryResultForQueryString(stub, queryString, thisClass) {

        console.info('- getQueryResultForQueryString queryString:\n' + queryString)
        let resultsIterator = await stub.getQueryResult(queryString);
        let method = thisClass['getAllResults'];

        let results = await method(resultsIterator, false);

        return Buffer.from(JSON.stringify(results));
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

};

shim.start(new Chaincode());
