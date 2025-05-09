const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect, manager } = require("../middleware/auth");

router
  .route("/project/:projectId")
  .get(protect, taskController.getTasksByProject);

// router.route("/me").get(protect, taskController.getMyTasks);

router.route("/").post(protect, manager, taskController.createTask);

// router
//   .route("/:id")
//   .put(protect, taskController.updateTask)
//   .delete(protect, manager, taskController.deleteTask);

module.exports = router;
