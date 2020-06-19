const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  FROM_EMAIL,
  FROM_NAME,
} = process.env;

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
  });

  let message = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<b>${options.html}</b>`,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
