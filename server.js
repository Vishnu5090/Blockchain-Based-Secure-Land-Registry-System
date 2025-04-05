// server.js

const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./blockchain');

// Create Express app
const app = express();
const blockchain = new Blockchain();
const sockets = [];

// Setup ports
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;

// Connect to peers (manually listed)
connectToPeer('ws://192.168.0.102:6002');
connectToPeer('ws://192.168.0.103:6003');
connectToPeer('ws://192.168.0.104:6004');

// WebSocket Server for P2P communication
const wss = new WebSocket.Server({ port: P2P_PORT });

wss.on('connection', (ws) => {
    sockets.push(ws);
    console.log('🔗 New node connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📩 Received:', data);

            if (data.type === 'NEW_BLOCK') {
                const newBlock = new Block(
                    data.block.index,
                    data.block.timestamp,
                    data.block.data,
                    data.block.previousHash
                );
                const success = blockchain.addBlock(newBlock);
                if (success) {
                    broadcastBlock(newBlock);
                }
            }
        } catch (error) {
            console.error('❌ Failed to parse incoming message:', error.message);
        }
    });

    ws.on('close', () => {
        console.log('🔌 Peer disconnected.');
        sockets.splice(sockets.indexOf(ws), 1);
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
    });
});

// 📢 Broadcast a new block to all connected nodes
function broadcastBlock(block) {
    sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'NEW_BLOCK', block }));
        }
    });
}

// 🧠 Create and mine a new block
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
        if (!sockets.includes(ws)) {
            sockets.push(ws);
        }
        console.log(`🔗 Connected to peer: ${peerUrl}`);
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📩 Received from peer:', data);

            if (data.type === 'NEW_BLOCK') {
                const newBlock = new Block(
                    data.block.index,
                    data.block.timestamp,
                    data.block.data,
                    data.block.previousHash
                );
                const success = blockchain.addBlock(newBlock);
                if (success) {
                    broadcastBlock(newBlock);
                }
            }
        } catch (error) {
            console.error('❌ Error processing peer message:', error.message);
        }
    });

    ws.on('close', () => {
        console.log(`🔌 Disconnected from peer: ${peerUrl}`);
        sockets.splice(sockets.indexOf(ws), 1);
    });

    ws.on('error', (error) => {
        console.error(`❌ Failed to connect to peer: ${peerUrl}`, error.message);
    });
}

// -------- Express HTTP APIs -------- //
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('✅ Land Registry Blockchain Server is Running!');
});

// Get full blockchain
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});

// Mine and add a new block
app.post('/mineBlock', (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: 'Missing data field' });
    }
    const newBlock = mineBlock(data);
    if (newBlock) {
        return res.json(newBlock);
    }
    return res.status(500).json({ error: 'Failed to mine block' });
});

// HTTP server listening
app.listen(HTTP_PORT, () => {
    console.log(`🚀 HTTP Server listening on port ${HTTP_PORT}`);
});

// Log WebSocket server
console.log(`🔌 P2P WebSocket Server running on port ${P2P_PORT}`);
