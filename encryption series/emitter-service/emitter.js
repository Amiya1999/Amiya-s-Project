// emitter-service/emitter.js

const socket = require('socket.io-client')('http://localhost:3000'); // Replace with the listener service URL
const crypto = require('crypto');
const fs = require('fs');

// Load data from data.json
const data = JSON.parse(fs.readFileSync('../data.json'));

function generateRandomMessage() {
  // Use data from data.json to randomize values
  const randomIndex = Math.floor(Math.random() * data.length);
  const { name, origin, destination } = data[randomIndex];

  const message = {
    name,
    origin,
    destination,
  };

  message.secret_key = crypto.createHash('sha256').update(JSON.stringify(message)).digest('hex');

  // Encrypt the payload using aes-256-ctr
  const encryptionKey = 'your-encryption-key'; // Replace with your encryption key
  const iv = crypto.randomBytes(16); // Generate a random IV (Initialization Vector)
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(encryptionKey), iv);

  // Convert the message object to a JSON string
  const payload = JSON.stringify(message);

  // Encrypt the payload
  const encryptedMessage = Buffer.concat([iv, cipher.update(payload), cipher.final()]).toString('hex');

  return encryptedMessage;
}

function sendMessages() {
  const messageCount = Math.floor(Math.random() * 450) + 50; // Randomize the number of messages
  const messages = [];

  for (let i = 0; i < messageCount; i++) {
    messages.push(generateRandomMessage());
  }

  const dataStream = messages.join('|');
  socket.emit('dataStream', dataStream);
}

setInterval(sendMessages, 10000); // Send data stream every 10 seconds
