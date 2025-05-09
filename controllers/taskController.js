const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const Project = require("../models/Project");
const TeamAssignment = require("../models/TeamAssignment");

const getTasksByProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (req.user.role !== "admin" && !project.manager.equals(req.user._id)) {
    t;
    const assignment = await TeamAssignment.findOne({
      project: project._id,
      user: req.user._id,
    });
    if (!assignment) {
      res.status(403);
      throw new Error("Not authorized to access tasks for this project");
    }
  }

  const tasks = await Task.find({ project: req.params.projectId })
    .populate("assignedTo", "name email")
    .populate("project", "title");

  res.json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const { projectId, title, description, dueDate } = req.body;

  console.log("came here projectID", projectId, title, description, dueDate);
  const project = await Project.findById(projectId);
  console.log("project found:", project);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const task = await Task.create({
    project: projectId,
    title,
    description,
    status: "todo",
    dueDate,
  });

  res.status(201).json(task);
});

module.exports = {
  getTasksByProject,
  createTask,
};
