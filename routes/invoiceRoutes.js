const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { protect, manager, admin } = require("../middleware/auth");
const { downloadInvoice } = require("../controllers/invoiceController");
router
  .route("/")
  .get(protect, manager, invoiceController.getInvoices)
  .post(protect, manager, invoiceController.createInvoice);

router
  .route("/:id/status")
  .put(protect, manager, invoiceController.updateInvoiceStatus);

router.route("/:id").delete(protect, admin, invoiceController.deleteInvoice);
router.get("/invoices/:id/download", protect, downloadInvoice);

module.exports = router;
