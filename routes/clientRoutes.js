const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { protect, manager, admin } = require("../middleware/auth");

router
  .route("/")
  .get(protect, clientController.getClients)
  .post(protect, manager, clientController.createClient);

router
  .route("/:id")
  .get(protect, clientController.getClient)
  .put(protect, manager, clientController.updateClient)
  .delete(protect, admin, clientController.deleteClient);

module.exports = router;
