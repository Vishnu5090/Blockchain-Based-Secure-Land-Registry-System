// client.js

const WebSocket = require('ws');
const readline = require('readline');

// Connect to your blockchain server
const SERVER_URL = 'ws://192.168.0.102:6001'; // Change the IP and PORT if needed
const ws = new WebSocket(SERVER_URL);

// Setup readline to take user input from terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Handle connection open
ws.on('open', () => {
    console.log('✅ Connected to blockchain server!');
    showMenu();
});

// Handle messages from server
ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        if (message.type === 'NEW_BLOCK') {
            console.log('\n📦 New Block Received:');
            console.log(JSON.stringify(message.block, null, 2));
        } else {
            console.log('\n📩 Message:', message);
        }
    } catch (err) {
        console.error('❌ Failed to parse message:', err.message);
    }
});

// Handle errors
ws.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
});

// Handle connection close
ws.on('close', () => {
    console.log('🔌 Disconnected from server');
    process.exit(0);
});

// Function to show a simple menu to the user
function showMenu() {
    console.log('\n--- Blockchain Client Menu ---');
    console.log('1. Add new block');
    console.log('2. Exit');
    rl.question('Select an option: ', (option) => {
        if (option === '1') {
            rl.question('Enter block data: ', (blockData) => {
                sendNewBlock(blockData);
                showMenu(); // After sending, show menu again
            });
        } else if (option === '2') {
            console.log('👋 Exiting...');
            ws.close();
            rl.close();
        } else {
            console.log('⚠️ Invalid option.');
            showMenu();
        }
    });
}

// Function to send new block data to server
function sendNewBlock(data) {
    const message = {
        type: 'NEW_BLOCK',
        block: {
            index: null,          // Server will compute correct index
            timestamp: Date.now(), // Local timestamp
            data: data,
            previousHash: null    // Server will compute previous hash
        }
    };
    ws.send(JSON.stringify(message));
    console.log('📤 New block request sent.');
}
