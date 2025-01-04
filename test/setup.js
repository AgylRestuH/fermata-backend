// test/setup.js
const chai = require("chai");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

const expect = chai.expect;
const request = supertest(app);

// Setup database connection untuk testing
before(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Error connecting to test database:", error);
  }
});

// Cleanup setelah testing selesai
after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

module.exports = {
  expect,
  request,
  mongoose,
};
