const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0; // 🔥 Important for mining
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto.createHash('sha256').update(
            this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce
        ).digest('hex');
    }

    mineBlock(difficulty) {
        // ⛏️ Proof of Work: finding a hash starting with difficulty zeros
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`⛏️ Block mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3; // 🔥 You can increase it later (more zeros = harder)
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty); // ⛏️ Mine block before adding
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false; // ❌ Current block tampered
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false; // ❌ Broken chain
            }
        }
        return true; // ✅ All good
    }
}

module.exports = { Blockchain, Block };
