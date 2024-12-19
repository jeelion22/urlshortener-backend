const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
} = require("./config");

const sendEmail = async (option) => {
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: true,
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
    });

    const emailOption = {
      from: "Url Shortner Support <jeeva.digitalocean@gmail.com",
      to: option.email,
      subject: option.subject,
      html: option.message,
    };

    await transporter.sendMail(emailOption);

    console.log("Email verification link sent successfully");
  } catch (error) {
    console.log("Error sending email verification:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
