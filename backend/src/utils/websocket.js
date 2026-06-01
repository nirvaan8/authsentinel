const { WebSocketServer } = require('ws');

let wss;

const initWebSocket = (server) => {
  wss = new WebSocketServer({
    port: 5001
  });

  wss.on('connection', (ws) => {
    console.log('📡 SOC Dashboard connected via WebSocket');

    ws.on('close', () => {
      console.log('📴 SOC Dashboard disconnected');
    });
  });

  console.log('✅ WebSocket server running on ws://localhost:5001');

  return wss;
};

const getWss = () => wss;

module.exports = {
  initWebSocket,
  getWss
};