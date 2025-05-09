const asyncHandler = require("express-async-handler");
const Invoice = require("../models/Invoice");
const Project = require("../models/Project");
const { sendInvoiceEmail } = require("../utils/emailService");
const PDFDocument = require("pdfkit");

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin/Manager)
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

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice._id}.pdf`
  );

  // Pipe PDF stream to response
  doc.pipe(res);

  // Invoice content
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
    // For managers, get invoices for projects they manage
    const projects = await Project.find({ manager: req.user._id });
    const projectIds = projects.map((p) => p._id);
    invoices = await Invoice.find({ project: { $in: projectIds } }).populate(
      "project",
      "title client"
    );
  }

  res.json(invoices);
});

// @desc    Get invoices for a specific project
// @route   GET /api/invoices/project/:projectId
// @access  Private
// const getProjectInvoices = asyncHandler(async (req, res) => {
//   const project = await Project.findById(req.params.projectId);

//   if (!project) {
//     res.status(404);
//     throw new Error("Project not found");
//   }

//   // Check if user has access to this project
//   if (req.user.role !== "admin" && !project.manager.equals(req.user._id)) {
//     res.status(403);
//     throw new Error("Not authorized to view invoices for this project");
//   }

//   const invoices = await Invoice.find({ project: req.params.projectId });
//   res.json(invoices);
// });

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private (Admin/Manager)
const createInvoice = asyncHandler(async (req, res) => {
  const { projectId, amount, dueDate } = req.body;

  // Verify project exists
  const project = await Project.findById(projectId);
  console.log("came here project for id :", project);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Check if user is the manager or admin
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
    console.log("came here to the email:", project.client.email);
    if (project.client && project.client.email) {
      await sendInvoiceEmail(project.client.email, invoice._id);
    }
  } catch (err) {
    console.error("Failed to send invoice email:", err.message);
    // You can choose to continue or fail the response depending on your needs
  }
  res.status(201).json(invoice);
});

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private (Admin/Manager)
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

  // Check if user is the manager or admin
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

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private (Admin)
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
  // getProjectInvoices,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};
