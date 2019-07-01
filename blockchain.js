const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//transaction counter
var transactionCounter = 0;

class Transaction {
    constructor(fromAddress, toAdress, amount) {
        this.fromAddress = fromAddress;
        this.toAdress = toAdress;
        this.amount = amount;
        this.sequence = ++transactionCounter;
        this.timestamp = Date.now();
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAdress + this.amount + this.sequence + this.timestamp)
            .toString();
    }

    signTransaction(signingKey) {
        const key = ec.keyFromPrivate(signingKey, 'hex');
        const singature = key.sign(this.calculateHash());
        this.signature = singature.toDER('hex');
    }

    isValid() {

        if(this.fromAddress === 'system') {
            //all reward transactions are valid
            return true;
        }

        if(this.signature === undefined) {
            return false;
        }

        const key = ec.keyFromPublic(this.fromAddress, 'hex');
        return key.verify(this.calculateHash(), this.signature);
    }
}

class Block {

    constructor(transactions, previousHash = '', timestamp = Date.now()) {
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.salt = 0;
        this.timestamp = timestamp;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(JSON.stringify(this.transactions).toString() + this.previousHash + this.salt + this.timestamp)
            .toString();
    }

    mineBlock(dificulty) {
        while(this.hash.substr(0,dificulty) !== '0'.repeat(dificulty)) {
            this.salt++;
            this.hash = this.calculateHash();
        }
    }

    isValid() {
        for(let t of this.transactions) {
            if(!t.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class BlockChain {
    constructor(dificulty = 2, rewardForMiner = 100) {
        this.dificulty = dificulty;
        this.rewardForMiner = rewardForMiner;
        this.chain = [ this.generateGenesisBlock() ];
        this.pendingTransactions = [];
    }

    generateGenesisBlock() {
        return new Block([ new Transaction('system', 'hello world!', 1) ], '', Date.parse('2009-01-01'));
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addPendingTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    minePendingTransaction(minerWallet) {
        this.pendingTransactions.push(new Transaction('system', minerWallet, this.rewardForMiner));
        const lastBlock = this.getLastBlock(); 
        const newBlock = new Block(this.pendingTransactions, lastBlock.hash);
        newBlock.mineBlock(this.dificulty);

        console.log('Block mined successfully!');

        this.chain.push(newBlock);
        this.pendingTransactions = [];
    }

    calculateBalance(walletAddress) {
        let balance = 0;
        for(let b of this.chain) {
            for(let t of b.transactions) {
                if(t.fromAddress === walletAddress) {
                    balance -= t.amount;
                }

                if(t.toAdress === walletAddress) {
                    balance += t.amount;
                }
            }
        }

        return balance;
    }

    isValid() {
        for(let i = 0; i < this.chain.length - 1; i++) {
            if(this.chain[i+1].previousHash !== this.chain[i].hash) {
                return false;
            }

            if(!this.chain[i].isValid()) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Transaction = Transaction;
module.exports.Block = Block;
module.exports.BlockChain = BlockChain;
