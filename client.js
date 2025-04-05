const WebSocket = require('ws');

function connectToPeer(peer) {
    const connection = new WebSocket(peer);

    connection.on('open', () => {
        console.log('Connected to:', peer);
    });

    connection.on('message', (message) => {
        console.log('Received:', JSON.parse(message));
    });
}

// Example: Change the IPs based on your network
connectToPeer('ws://255.255.255.0'); // Node 1
connectToPeer('ws://192.168.43.118'); // Node 2
connectToPeer('ws://192.168.230.195'); // Node 3
connectToPeer('ws://192.168.43.77'); // Node 4
