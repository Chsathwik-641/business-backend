const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { protect, manager } = require("../middleware/auth");

router.route("/project/:projectId").get(protect, teamController.getProjectTeam);

router.route("/").post(protect, /*manager*/ teamController.assignTeamMember);

// router
//   .route("/:id")
//   .delete(protect, manager, /*manager*/ teamController.removeTeamMember);

// router.route("/user/:userId").get(protect, teamController.getUserProjects);
// router
//   .route("/bulk")
//   .post(protect, manager, teamController.assignMultipleTeamMembers);

module.exports = router;
