// server.js

const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./blockchain');

const app = express();
const blockchain = new Blockchain();
const sockets = [];

const HTTP_PORT = process.env.HTTP_PORT || 3001; // API Server Port
const P2P_PORT = process.env.P2P_PORT || 6001;    // Peer-to-Peer WebSocket Port

const wss = new WebSocket.Server({ port: P2P_PORT });

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

// 📢 Broadcast a new block to all connected nodes
function broadcastBlock(block) {
    sockets.forEach((socket) => {
        socket.send(JSON.stringify({ type: 'NEW_BLOCK', block }));
    });
}

// 🧠 Create a new block
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

// 🌐 Connect to another peer
function connectToPeer(peerUrl) {
    const ws = new WebSocket(peerUrl);
    ws.on('open', () => {
        sockets.push(ws);
        console.log(`🔗 Connected to peer: ${peerUrl}`);
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
        console.error(`❌ Failed to connect to peer: ${peerUrl}`, error.message);
    });
}

// -------- Express APIs -------- //
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('✅ Land Registry Blockchain Server is Running!');
});

// Get blockchain
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});

// Mine a new block
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

// Register land with duplicate plotId check
app.post('/register', (req, res) => {
    const landData = req.body;
    if (blockchain.isDuplicateData(landData)) {
        return res.status(400).json({
            message: `❌ Plot ID ${landData.plotId} already registered!`
        });
    }

    const newBlock = mineBlock(landData);
    if (newBlock) {
        res.json({
            message: '✅ Land Registered Successfully!',
            block: newBlock
        });
    } else {
        res.status(400).json({ message: '❌ Failed to register land.' });
    }
});

// 🧩 Connect to a new peer via API
app.post('/peers', (req, res) => {
    const { peer } = req.body; // Example: ws://192.168.1.5:6001
    connectToPeer(peer);
    res.json({ message: `Connecting to peer: ${peer}` });
});

// Start Express server
app.listen(HTTP_PORT, () => {
    console.log(`🚀 HTTP Server running on port ${HTTP_PORT}`);
});

console.log(`🌐 WebSocket P2P Server running on port ${P2P_PORT}`);
