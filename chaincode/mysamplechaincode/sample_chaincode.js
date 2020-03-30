'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
    async Init(stub) {
        const ret = stub.getFunctionAndParameters();
        console.log(ret);
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
        if (args.length != 4) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }
        console.info('--- start init users ---')
        if (args[0].lenth <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].lenth <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].lenth <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].lenth <= 0) {
            throw new Error('4th argument must be a non-empty string');
        }

        let userName = args[0];
        let userMobile = args[1].toLowerCase();
        let userCompany = args[3].toLowerCase();
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
        user.company = userCompany;
        user.amount = userAmount;

        await stub.putState(userName, Buffer.from(JSON.stringify(user)));

        let indexName = `mobile~name`;
        let mobileNameIndexKey = await stub.createCompositeKey(indexName, [user.mobile, user.name]);
        console.log(mobileNameIndexKey);

        await stub.putState(mobileNameIndexKey, Buffer.from('\u0000'));
        console.info("end of initialzation");
    }

    async readMobile(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the marble to query');
        }

        let mobile = args[0];
        if (!mobile) {
            throw new Error(`Mobile number cant be blank`);
        }

        let user = await stub.getState(mobile);
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

    async deleteMobile(stud, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the marble to delete');
        }

        let mobile = args[0];
        if (!mobile) {
            throw new Error(`Mobile number cant be left blank`);
        }

        let user = await stub.getState(mobile);
        if (!user) {
            throw Error(`Cannot find the user this is mobile number`);
        }

        let userJSON = {}
        try {
            userJSON = JSON.parse(user.toString());
        } catch (error) {
            let jsonError = {};
            jsonError.Error = `Unable to decode json of ${mobile}`;
            throw new Error(JSON.stringify(jsonError));
        }

        await stub.deleteState(mobile);

        const indexName = `mobile~name`;
        let mobileNameIndexKey = stub.createCompositeKey(indexName, [userJSON.mobile, userJSON.name]);
        if (!mobileNameIndexKey) {
            throw new Error(`Failed to create a composite key`);
        }

        await stub.deleteState(mobileNameIndexKey);
    }

    async getMobileHistory(stud, args, thisClass) {
        if (args.length < 1) {
            throw new Error(`Invalid number of arguments`);
        }
        let mobile = args[0];
        if (!mobile) {
            throw new Error(`Mobile cant be an empty string`);
        }

        let resultsIterator = await stub.getMobileHistory(mobile);
        let method = thisClass['getAllResults'];
        let results = await method(resultsIterator, true);
        return Buffer.from(JSON.stringify(results));
    }

    async queryUser(stub, args, thisClass) {
        if (args.length < 1) {
            throw new Error(`Invalid number of arguments.`);
        }

        let userName = args[0].toLowerCase();

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'user';
        queryString.selector.owner = userName;

        let method = thisClass['getQueryResultForQueryString'];
        let queryResult = await method(stub, JSON.stringify(queryString), thisClass);

        return queryResult;
    }

    async queryMobile(stub, args, thisClass) {
        if (args.length < 1) {
            throw new Error(`Incorrent number of argument. expecting Query String`);
        }

        let queryString = args[0];
        if (!queryString) {
            throw new Error(`Query String should not be empty`);
        }

        let method = thisClass['getQueryResultForQueryString'];
        let queryResult = await method(stub, queryString, thisClass);
        return queryResult;

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
}