const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { protect, manager } = require("../middleware/auth");

router.route("/project/:projectId").get(protect, teamController.getProjectTeam);

router.route("/").post(protect, teamController.assignTeamMember);

module.exports = router;
