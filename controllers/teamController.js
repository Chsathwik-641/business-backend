const asyncHandler = require("express-async-handler");
const TeamAssignment = require("../models/TeamAssignment");
const User = require("../models/User");
const Project = require("../models/Project");

const getProjectTeam = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const teamAssignments = await TeamAssignment.find({
    project: req.params.projectId,
  }).populate("user", "name email role");
  console.log("got team here:", teamAssignments);

  res.json(teamAssignments);
});

const assignTeamMember = asyncHandler(async (req, res) => {
  const { projectId, userId, roleInProject } = req.body;
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const existingAssignment = await TeamAssignment.findOne({
    project: projectId,
    user: userId,
  });

  if (existingAssignment) {
    res.status(400);
    throw new Error("User is already assigned to this project");
  }

  const assignment = await TeamAssignment.create({
    project: projectId,
    user: userId,
    roleInProject,
  });

  res.status(201).json(assignment);
});

module.exports = {
  getProjectTeam,
  assignTeamMember,
};
