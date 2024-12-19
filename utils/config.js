require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const SERVER_PORT = process.env.SERVER_PORT;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

module.exports = {
  JWT_SECRET,
  SERVER_PORT,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
};
