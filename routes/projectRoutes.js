const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect, manager, admin } = require("../middleware/auth");

router
  .route("/")
  .get(protect, projectController.getProjects)
  .post(protect, manager, projectController.createProject);

router
  .route("/:id")
  .get(protect, projectController.getProject)
  .post(protect, manager, projectController.updateProject)
  .delete(protect, admin, projectController.deleteProject);

// router.route("/:id/tasks").get(protect, projectController.getProjectTasks);

module.exports = router;
