function connectWebSocket(onAlert) {
  const ws = new WebSocket('ws://localhost:5002');
  ws.onopen = () => console.log('WebSocket connected');
  ws.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    onAlert(alert);
  };
  ws.onerror = (err) => console.error('WebSocket error:', err);
  ws.onclose = () => console.log('WebSocket disconnected');
  return ws;
}