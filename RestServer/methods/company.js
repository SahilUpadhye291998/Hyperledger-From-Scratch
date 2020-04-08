const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin,
} = require("fabric-network");
const path = require("path");

const ccpPath = path.resolve(__dirname, "..", "..", "connection-org2.json");

async function registerCompany(secretCompanyName, companyOrg) {
  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists(secretCompanyName);
    if (userExists) {
      console.log(
        'An identity for the user "user1" already exists in the wallet'
      );
      return;
    }
    const adminExists = await wallet.exists("adminOrg2");
    if (!adminExists) {
      console.log(
        'An identity for the admin user "adminOrg2" does not exist in the wallet'
      );
      console.log("Run the enrollAdmin.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: "adminOrg2", //TODO: check if we can change this
      discovery: { enabled: true, asLocalhost: true },
    });
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();

    const secret = await ca.register(
      {
        affiliation: `${companyOrg}.department1`,
        enrollmentID: `${secretCompanyName}`,
        role: "client",
      },
      adminIdentity
    );
    const enrollment = await ca.enroll({
      enrollmentID: `${secretCompanyName}`,
      enrollmentSecret: secret,
    });

    const msp =
      companyOrg.charAt(0).toUpperCase() + companyOrg.slice(1) + "MSP";
    const userIdentity = X509WalletMixin.createIdentity(
      `${msp}`,
      enrollment.certificate,
      enrollment.key.toBytes()
    );

    await wallet.import(secretCompanyName, userIdentity);
    console.log(
      'Successfully registered and enrolled admin user "user1" and imported it into the wallet'
    );
  } catch (error) {
    console.error(error);
    console.log("Some error has occured please contact web Master");
  }
}

async function initCompany(
  secretUserName,
  companyName,
  companyAddress,
  companyMobile,
  companySecret,
  companyAmount
) {
  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(walletPath);

    const userExists = await wallet.exists(secretUserName);
    if (!userExists) {
      console.log("Please check this user does not exists");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: secretUserName,
      discovery: {
        enabled: true,
        asLocalhost: true,
      },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("mycc");

    await contract.submitTransaction(
      "initCompany",
      companyName,
      companyAddress,
      companyMobile,
      companySecret,
      companyAmount
    );

    const json = {
      message: "Successfully Signed Up",
    };

    await gateway.disconnect();
    return json;
  } catch (error) {
    console.error(error);
    const json = {
      message: "UnSuccessfully in paying the premium",
    };
    console.log("Some error has occured please contact web Master");
  }
}

async function readCompanyByOwnerAndPassword(
  secretCompanyName,
  companyName,
  companyPassword
) {
  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(walletPath);

    const userExists = await wallet.exists(secretCompanyName);
    if (!userExists) {
      console.log("Please check this user does not exists");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: secretCompanyName,
      discovery: {
        enabled: true,
        asLocalhost: true,
      },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("mycc");

    const result = await contract.evaluateTransaction(
      "queryCompanyByOwnerAndPassword",
      companyName,
      companyPassword
    );

    return JSON.parse(result.toString());
  } catch (error) {
    console.log("Some error has occured please contact web Master");
  }
}

async function readCompany(secretCompanyName, companyName) {
  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(walletPath);

    const userExists = await wallet.exists(secretCompanyName);
    if (!userExists) {
      console.log("Please check this user does not exists");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: secretCompanyName,
      discovery: {
        enabled: true,
        asLocalhost: true,
      },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("mycc");

    const result = await contract.evaluateTransaction(
      "queryCompanyByName",
      companyName
    );
    return JSON.parse(result.toString());
  } catch (error) {
    console.log("Some error has occured please contact web Master");
  }
}

async function readCompanyHistory(secretCompanyName, companyName) {
  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(walletPath);

    const userExists = await wallet.exists(secretCompanyName);
    if (!userExists) {
      console.log("Please check this user does not exists");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: secretCompanyName,
      discovery: {
        enabled: true,
        asLocalhost: true,
      },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("mycc");

    const result = await contract.evaluateTransaction(
      "getHistoryForUser",
      companyName
    );
    return JSON.parse(result.toString());
  } catch (error) {
    console.log("Some error has occured please contact web Master");
  }
}

async function payCompansation(
  secretCompanyName,
  companyName,
  userName,
  compansationPercent
) {
  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(walletPath);

    const userExists = await wallet.exists(secretCompanyName);
    if (!userExists) {
      console.log("Please check this user does not exists");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: secretCompanyName,
      discovery: {
        enabled: true,
        asLocalhost: true,
      },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("mycc");

    await contract.submitTransaction(
      "payPremiumByUserName",
      companyName,
      userName,
      compansationPercent
    );

    const json = {
      message: "Successfully Compansated the premium",
    };

    await gateway.disconnect();
    return json;
  } catch (error) {
    console.error(error);
    const json = {
      message: "UnSuccessful in compansating the user",
    };
    console.log("Some error has occured please contact web Master");
  }
}

module.exports = {
  registerCompany,
  initCompany,
  readCompanyByOwnerAndPassword,
  readCompany,
  readCompanyHistory,
  payCompansation,
};
