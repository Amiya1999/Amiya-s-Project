const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const appointmentsController = require('./appointmentsController');

const app = express();

// middleware to parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// middleware to serve the form HTML file
app.get('/', appointmentsController.showForm);

// route to handle form submissions
app.post('/submit', appointmentsController.addAppointment);

// route to fetch appointments from database and display on screen
app.get('/appointments', appointmentsController.getAppointments);

// DELETE endpoint to delete an appointment by ID
app.delete('/appointments/:id', appointmentsController.deleteAppointment);

app.listen(4000, () => {
  console.log('Server started on port 4000');
});
