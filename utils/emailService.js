const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Configure your email transport (use your email service's credentials)
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Update to your real SMTP service
  port: 2525,
  auth: {
    user: "f125752bd2d42a",
    pass: process.env.YOUR_FULL_PASSWORD, // Ensure your environment variable is set
  },
});

const sendInvoiceEmail = async (recipientEmail, invoiceId) => {
  // const invoiceUrl = `${process.env.FRONTEND_URL}/invoices/${invoiceId}`; // Or backend download link
  const invoiceUrl = `#`;
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
    // Use the correct variable name 'transport'
    await transport.sendMail(mailOptions);
    console.log(`Invoice email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw new Error("Failed to send invoice email");
  }
};

module.exports = { sendInvoiceEmail };
