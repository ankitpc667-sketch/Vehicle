// test-mongo.js – quick connection sanity check
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => {
    console.log('✅ Test connection succeeded');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Test connection failed:', err.message);
    process.exit(1);
  });
