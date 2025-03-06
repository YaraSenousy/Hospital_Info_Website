const mongoose = require('mongoose');
require('dotenv').config();

jest.setTimeout(30000); // Increase timeout to 30 seconds

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
});

// afterAll(async () => {
//   try {
//     await mongoose.connection.close();
//     console.log('Database connection closed');
//   } catch (error) {
//     console.error('Error closing database connection:', error);
//     process.exit(1);
//   }
// }); 