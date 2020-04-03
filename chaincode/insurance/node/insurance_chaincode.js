// see how we can transfer the amount from the user to company
// i see the code to be written would be more appropriate if written on comany side
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

        await stub.putState(userName, Buffer.from(JSON.stringify(user)));

        let indexName = `secret~name`;
        let mobileNameIndexKey = await stub.createCompositeKey(indexName, [user.secret, user.name]);
        console.log(mobileNameIndexKey);

        await stub.putState(mobileNameIndexKey, Buffer.from('\u0000'));
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

        let userJSON = {}
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

        await stub.deleteState(secretNameIndexKey);
    }


}

shim.start(new Chaincode());