const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect, manager } = require("../middleware/auth");

router
  .route("/project/:projectId")
  .get(protect, taskController.getTasksByProject);

router.route("/").post(protect, manager, taskController.createTask);
module.exports = router;
