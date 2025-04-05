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
    console.log('🔗 New node connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('📩 Received:', data);

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

// 🔥 Helper: Broadcast a new block to all connected nodes
function broadcastBlock(block) {
    sockets.forEach((socket) => {
        socket.send(JSON.stringify({ type: 'NEW_BLOCK', block }));
    });
}

// 🔥 Helper: Mine and broadcast a new block
function mineBlock(data) {
    const newBlock = new Block(
        blockchain.chain.length,
        Date.now(),
        data,
        blockchain.getLatestBlock().hash
    );
    const success = blockchain.addBlock(newBlock);
    if (success) {
        broadcastBlock(newBlock);
        return newBlock;
    }
    return null;
}

// 🔥 Helper: Connect to another peer manually
function connectToPeer(peer) {
    const ws = new WebSocket(peer);
    ws.on('open', () => {
        sockets.push(ws);
        console.log(`🔗 Connected to new peer: ${peer}`);
    });
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('📩 Received from peer:', data);

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
    ws.on('error', (error) => {
        console.error(`❌ Failed to connect to peer: ${peer}`, error.message);
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
    const newBlock = mineBlock(data);

    if (newBlock) {
        res.json({
            message: '⛏️ New block mined successfully',
            block: newBlock
        });
    } else {
        res.status(400).json({ message: '❌ Failed to mine new block.' });
    }
});

// Route: Register land details with duplicate plotId check
app.post('/register', (req, res) => {
    const landData = req.body; // { ownerName, plotId, area, location }

    // 🔥 Check for duplicate plotId
    if (blockchain.isDuplicateData(landData)) {
        return res.status(400).json({
            message: `❌ Plot ID ${landData.plotId} already registered! Duplicate entry not allowed.`
        });
    }

    // ✅ No duplicate found, proceed to mine and broadcast
    const newBlock = mineBlock(landData);

    if (newBlock) {
        res.json({
            message: '✅ Land registered successfully',
            block: newBlock
        });
    } else {
        res.status(400).json({ message: '❌ Failed to register land.' });
    }
});

// 🔥 NEW: Route to connect to another peer manually
app.post('/addPeer', (req, res) => {
    const { peer } = req.body; // Example: { "peer": "ws://localhost:6002" }
    connectToPeer(peer);
    res.json({ message: `⏩ Trying to connect to peer: ${peer}` });
});

// Start the API Server
app.listen(3001, () => {
    console.log('✅ API Server running on http://localhost:3001');
});

// Log blockchain server
console.log('✅ Blockchain Node WebSocket server running on ws://localhost:6001');
