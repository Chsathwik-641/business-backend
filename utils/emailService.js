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

const sendInvoiceEmail = async (recipientEmail, fullInvoice) => {
  const { project, amount, dueDate, status, clientInfo } = fullInvoice;
  const clientName = clientInfo.name;
  const clientEmail = clientInfo.email;
  const projectTitle = project.title;

  const mailOptions = {
    from: `"Your Company" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "New Invoice Available",
    html: `
      <p>Hello ${clientName},</p>
      <p>Your invoice is ready for the project: <strong>${projectTitle}</strong></p>
      <p><strong>Invoice ID:</strong> ${fullInvoice._id}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Due Date:</strong> ${dueDate.toDateString()}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Client Name:</strong> ${clientName}</p>
      <p><strong>Client Email:</strong> ${clientEmail}</p>
      <p>You can view or download the invoice using the link below:</p>
    
      <p>Thank you for your business!</p>
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
