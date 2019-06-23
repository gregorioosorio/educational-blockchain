const BlockChain = require('./blockchain').BlockChain;
const Transaction = require('./blockchain').Transaction;
const Wallet = require('./wallet').Wallet;

const blockchain = new BlockChain(3, 100);
console.log(JSON.stringify(blockchain, null, 4).toString());
console.log(blockchain.isValid());

console.log('We will perform some transactions!')

const user1 = new Wallet('user1');
const user2 = new Wallet('user2');

blockchain.addPendingTransaction(
    new Transaction(
        user1.walletAddress,
        user2.walletAddress,
        10));

blockchain.addPendingTransaction(
    new Transaction(
        user2.walletAddress,
        user1.walletAddress,
        20));

blockchain.minePendingTransaction(user2.walletAddress);

console.log(JSON.stringify(blockchain, null, 4).toString());
console.log(blockchain.isValid());

console.log('+++ balance: +++');
console.log('user1: ' + blockchain.calculateBalance(user1.walletAddress));
console.log('user2: ' + blockchain.calculateBalance(user2.walletAddress));
console.log('system: ' + blockchain.calculateBalance('system'));
