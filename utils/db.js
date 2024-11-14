const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connection established'))
  .catch(err => console.log(err));