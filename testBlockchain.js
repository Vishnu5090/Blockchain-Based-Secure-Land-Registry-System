const { Blockchain, Block } = require('./blockchain');

// Create blockchain instance
let myCoin = new Blockchain();

// Add blocks
myCoin.addBlock(new Block(1, Date.now(), { amount: 100 }));
myCoin.addBlock(new Block(2, Date.now(), { amount: 50 }));

// Validate blockchain
console.log("Is blockchain valid?", myCoin.isChainValid()); // Should be true

// Tampering (simulate attack)
myCoin.chain[1].data = { amount: 10000 }; // Attack
myCoin.chain[1].hash = myCoin.chain[1].calculateHash(); // Try to fix hash

// Validate again
console.log("Is blockchain valid after tampering?", myCoin.isChainValid()); // Should be false
