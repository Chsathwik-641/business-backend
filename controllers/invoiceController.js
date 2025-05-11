const asyncHandler = require("express-async-handler");
const Invoice = require("../models/Invoice");
const Project = require("../models/Project");
const { sendInvoiceEmail } = require("../utils/emailService");
const PDFDocument = require("pdfkit");

const downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate({
    path: "project",
    populate: { path: "client", select: "name email" },
  });

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice ID: ${invoice._id}`);
  doc.text(`Project: ${invoice.project.title}`);
  doc.text(`Client: ${invoice.project.client?.name || "N/A"}`);
  doc.text(`Client Email: ${invoice.project.client?.email || "N/A"}`);
  doc.text(`Amount: $${invoice.amount}`);
  doc.text(`Status: ${invoice.status}`);
  doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
  if (invoice.paidDate) {
    doc.text(`Paid Date: ${invoice.paidDate.toDateString()}`);
  }

  doc.end();
});
const getInvoices = asyncHandler(async (req, res) => {
  let invoices;

  if (req.user.role === "admin") {
    invoices = await Invoice.find().populate("project", "title client");
  } else {
    const projects = await Project.find({ manager: req.user._id });
    const projectIds = projects.map((p) => p._id);
    invoices = await Invoice.find({ project: { $in: projectIds } }).populate(
      "project",
      "title client"
    );
  }

  res.json(invoices);
});

const createInvoice = asyncHandler(async (req, res) => {
  const { projectId, amount, dueDate } = req.body;

  const project = await Project.findById(projectId).populate(
    "client",
    "name email"
  );

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (req.user.role !== "admin" && !project.manager.equals(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to create invoices for this project");
  }

  const invoice = await Invoice.create({
    project: projectId,
    amount,
    status: "pending",
    dueDate,
  });
  try {
    if (project.client && project.client.email) {
      await sendInvoiceEmail(project.client.email, invoice._id);
    }
  } catch (err) {
    console.error("Failed to send invoice email:", err.message);
  }
  res.status(201).json(invoice);
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const invoice = await Invoice.findById(req.params.id).populate(
    "project",
    "manager"
  );

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  if (
    req.user.role !== "admin" &&
    !invoice.project.manager.equals(req.user._id)
  ) {
    res.status(403);
    throw new Error("Not authorized to update this invoice");
  }

  invoice.status = status;
  if (status === "paid") {
    invoice.paidDate = new Date();
  }

  const updatedInvoice = await invoice.save();
  res.json(updatedInvoice);
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  await invoice.deleteOne();
  res.json({ message: "Invoice removed" });
});

module.exports = {
  downloadInvoice,
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};
