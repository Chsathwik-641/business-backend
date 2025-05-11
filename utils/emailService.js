const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvoiceEmail = async (recipientEmail, invoiceId) => {
  const invoiceUrl = `${process.env.FRONTEND_URL}/invoices/${invoiceId}`;

  const mailOptions = {
    from: `"Your Company" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "New Invoice Available",
    html: `
      <p>Hello,</p>
      <p>Your invoice is ready. You can view or download it using the link below:</p>
      <a href="${invoiceUrl}">${invoiceUrl}</a>
      <p>Thank you!</p>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`Invoice email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw new Error("Failed to send invoice email");
  }
};

module.exports = { sendInvoiceEmail };
