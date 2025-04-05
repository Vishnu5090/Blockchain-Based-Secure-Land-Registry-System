const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let blockchain = []; // 🧱 Array acting as the blockchain

// Load blockchain from file if it exists
const blockchainFile = 'blockchain.json';
if (fs.existsSync(blockchainFile)) {
    const fileData = fs.readFileSync(blockchainFile);
    blockchain = JSON.parse(fileData);
}

// Hash function
function hashBlock(block) {
    const blockString = JSON.stringify(block);
    return crypto.createHash('sha256').update(blockString).digest('hex');
}

// Create a block
function createBlock(data, previousHash = '') {
    const timestamp = new Date().toISOString();
    const block = {
        index: blockchain.length + 1,
        timestamp,
        ...data,
        previousHash,
    };
    block.currentHash = hashBlock(block);
    return block;
}

// Register Land Title (POST /register)
app.post('/register', (req, res) => {
    const data = req.body;
    const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].currentHash : '0';
    const newBlock = createBlock(data, previousHash);
    blockchain.push(newBlock);

    // Save blockchain to file
    fs.writeFileSync(blockchainFile, JSON.stringify(blockchain, null, 2));
    res.status(201).json({ message: 'Block added successfully!', block: newBlock });
});

// Get Transaction History (GET /history/:plotId)
app.get('/history/:plotId', (req, res) => {
    const plotId = req.params.plotId;
    const history = blockchain.filter(block => block.plotId === plotId);
    res.json(history);
});

// Get Full Blockchain (GET /chain)
app.get('/chain', (req, res) => {
    res.json(blockchain);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Blockchain server running at http://localhost:${PORT}`);
});
