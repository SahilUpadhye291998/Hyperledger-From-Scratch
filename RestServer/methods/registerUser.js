const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..','..','connection-org1.json');

async function registerUser(userName, userOrg){
    try{
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists(userName);
        if (userExists) {
            console.log('An identity for the user "user1" already exists in the wallet');
            return;
        }
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }   

        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        const secret = await ca.register({ affiliation: `${userOrg}.department1`, enrollmentID: `${userName}`, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: `${userName}` , enrollmentSecret: secret });

        const msp = userOrg.charAt(0).toUpperCase() + userOrg.slice(1) + 'MSP';
        const userIdentity = X509WalletMixin.createIdentity(`${msp}`, enrollment.certificate, enrollment.key.toBytes());

        await wallet.import(userName, userIdentity);
        console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');        
    }catch(error){
        console.log('Some error has occured please contact web Master');
    }
}

module.exports = {
    registerUser
};
