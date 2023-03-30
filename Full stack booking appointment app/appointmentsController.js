const db = require('./database');

exports.showForm = (req, res) => {
  res.sendFile('take-data.html', { root: __dirname });
};

exports.addAppointment = (req, res) => {
  const { name, date, time } = req.body;
  console.log("name:", name);
  console.log("date:", date);
  console.log("time:", time);
  db.execute('INSERT INTO appointments (name, date, time) VALUES (?, ?, ?)', [name, date, time])
    .then(() => {
      console.log(`New appointment added: ${name} - ${date} ${time}`);
      res.redirect('/appointments');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error submitting appointment');
    });
};

exports.getAppointments = (req, res) => {
  console.log('Fetching appointments');
  db.query('SELECT * FROM appointments')
    .then(([rows, fields]) => {
      console.log('Appointments fetched successfully:', rows);
      res.send(rows);
    })
    .catch((err) => {
      console.log('Error fetching appointments:', err);
      res.status(500).send('Error fetching appointments');
    });
};

exports.deleteAppointment = (req, res) => {
  const appointmentId = req.params.id;
  db.execute('DELETE FROM appointments WHERE id = ?', [appointmentId])
    .then(() => {
      res.send(`Appointment with ID ${appointmentId} has been deleted.`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(`Error deleting appointment with ID ${appointmentId}`);
    });
};
