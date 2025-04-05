// blockchain.js

const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto.createHash('sha256').update(
            this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)
        ).digest('hex');
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    isDuplicateData(data) {
        if (!data || typeof data !== 'object') return false;
        return this.chain.some(block => 
            block.data && typeof block.data === 'object' && block.data.plotId === data.plotId
        );
    }

    addBlock(newBlock) {
        if (this.isDuplicateData(newBlock.data)) {
            console.log('❌ Duplicate plotId detected! Block rejected.');
            return false;
        }

        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
        console.log('✅ Block added to chain.');
        return true;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.error(`❌ Invalid hash at block ${i}!`);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`❌ Invalid previousHash link at block ${i}!`);
                return false;
            }
        }
        console.log('✅ Blockchain integrity verified.');
        return true;
    }

    // Optional: Pretty-print the chain
    printChain() {
        console.log(JSON.stringify(this.chain, null, 4));
    }
}

module.exports = { Blockchain, Block };
