const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./blockchain');

const app = express();
const blockchain = new Blockchain();
const sockets = [];

// Start WebSocket Server (for peer-to-peer)
const wss = new WebSocket.Server({ port: 6001 });

wss.on('connection', (ws) => {
    sockets.push(ws);
    console.log('New node connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received:', data);

        if (data.type === 'NEW_BLOCK') {
            blockchain.addBlock(new Block(
                data.block.index,
                data.block.timestamp,
                data.block.data,
                data.block.previousHash
            ));
            broadcastBlock(data.block);
        }
    });
});

// Broadcast a new block to all connected nodes
function broadcastBlock(block) {
    sockets.forEach((socket) => {
        socket.send(JSON.stringify({ type: 'NEW_BLOCK', block }));
    });
}

// API Server (Express)
app.use(bodyParser.json());

// ✅ Default homepage route
app.get('/', (req, res) => {
    res.send('✅ Land Registry Blockchain Server is Running!');
});

// Route: Get all blocks
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});

// Route: Mine a new block (simple data)
app.post('/mineBlock', (req, res) => {
    const { data } = req.body;
    const newBlock = new Block(
        blockchain.chain.length,
        Date.now(),
        data,
        blockchain.getLatestBlock().hash
    );
    blockchain.addBlock(newBlock);
    broadcastBlock(newBlock);
    res.json({
        message: 'New block mined successfully',
        block: newBlock
    });
});

// Route: Register land details
app.post('/register', (req, res) => {
    const { ownerName, plotId, area, location } = req.body;
    const landData = { ownerName, plotId, area, location };

    const newBlock = new Block(
        blockchain.chain.length,
        Date.now(),
        landData,
        blockchain.getLatestBlock().hash
    );
    blockchain.addBlock(newBlock);
    broadcastBlock(newBlock);
    res.json({
        message: 'Land registered successfully',
        block: newBlock
    });
});

// Start the API Server
app.listen(3001, () => {
    console.log('✅ API Server running on http://localhost:3001');
});

// Log blockchain server
console.log('✅ Blockchain Node WebSocket server running on ws://localhost:6001');
    