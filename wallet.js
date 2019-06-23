const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Wallet {
    constructor(username) {
        this.username = username;
        this.genKeyPair();
    }

    genKeyPair() {
        const key = ec.genKeyPair();
        this.walletAddress = key.getPublic('hex');
        this.privateKey = key.getPrivate('hex');
    }
}

module.exports.Wallet = Wallet;