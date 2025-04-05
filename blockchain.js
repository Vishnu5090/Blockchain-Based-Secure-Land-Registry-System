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
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    isDuplicateData(newData) {
        // Check if any block already contains same plot_id
        for (const block of this.chain) {
            if (block.data.plot_id === newData.plot_id) {
                console.log(`❌ Duplicate plot_id found: ${newData.plot_id}`);
                return true;
            }
        }
        return false;
    }

    addBlock(newBlock) {
        if (this.isDuplicateData(newBlock.data)) {
            console.log('❌ Block not added due to duplicate data!');
            return; // Do not add duplicate blocks
        }

        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
        console.log('✅ Block added successfully.');
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log(`❌ Block ${i} has invalid hash!`);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`❌ Block ${i} has invalid previous hash link!`);
                return false;
            }
        }
        console.log('✅ Blockchain is valid!');
        return true;
    }
}

module.exports = { Blockchain, Block };
