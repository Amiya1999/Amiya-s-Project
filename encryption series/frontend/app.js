// frontend/app.js

const socket = new WebSocket('ws://localhost:3000'); // Replace with the listener service WebSocket URL
const dataTable = document.getElementById('data-table').querySelector('tbody');
const successRateElement = document.getElementById('success-rate');

socket.addEventListener('open', (event) => {
  console.log('WebSocket connection established');
});

socket.addEventListener('message', (event) => {
  // Parse the received JSON data
  const data = JSON.parse(event.data);

  // Add data to the table
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${data.name}</td>
    <td>${data.origin}</td>
    <td>${data.destination}</td>
    <td>${new Date(data.timestamp).toLocaleString()}</td>
  `;
  dataTable.appendChild(row);

  // Calculate and update the success rate
  const successRate = ((dataTable.children.length / data.total) * 100).toFixed(2);
  successRateElement.textContent = `Success Rate: ${successRate}%`;
});

socket.addEventListener('close', (event) => {
  console.log('WebSocket connection closed');
});

socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});
