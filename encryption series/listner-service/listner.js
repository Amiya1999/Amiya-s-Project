// listener-service/listener.js

const io = require('socket.io')(3000); // Replace with the desired port
const mongoose = require('mongoose');
const crypto = require('crypto');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/timeseriesdb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('MongoDB connected');
});

// Define MongoDB schema and model
const timeSeriesSchema = new mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  timestamp: { type: Date, default: Date.now },
});

const TimeSeriesModel = mongoose.model('TimeSeries', timeSeriesSchema);

// WebSocket server
io.on('connection', (socket) => {
  console.log('Emitter connected');

  socket.on('dataStream', (dataStream) => {
    // Split the data stream into individual messages
    const messages = dataStream.split('|');

    // Process and validate each message
    for (const message of messages) {
      // Decrypt and parse the message (Implement decryption logic here)
      const decryptedMessage = JSON.parse(message);

      // Validate the message and check data integrity using the secret_key
      if (validateMessage(decryptedMessage)) {
        const timeSeriesData = new TimeSeriesModel(decryptedMessage);
        timeSeriesData.save((err) => {
          if (err) {
            console.error('Error saving data to MongoDB:', err);
          } else {
            console.log('Data saved to MongoDB:', decryptedMessage);
          }
        });
      }
    }
  });
});

// Implement the validateMessage function to check the secret_key and data integrity
function validateMessage(message) {
  // Recreate the secret_key based on the received message
  const recreatedSecretKey = crypto.createHash('sha256').update(JSON.stringify({
    name: message.name,
    origin: message.origin,
    destination: message.destination
  })).digest('hex');

  // Compare the recreated secret_key with the received secret_key
  if (recreatedSecretKey !== message.secret_key) {
    console.error('Invalid secret_key. Data integrity compromised.');
    return false;
  }

  // Additional data integrity checks can be added here if needed

  return true; // Return true if the message is valid, otherwise false
}
