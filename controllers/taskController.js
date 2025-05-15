const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const Project = require("../models/Project");
const TeamAssignment = require("../models/TeamAssignment");

const getTasksByProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const assignments = await TeamAssignment.find({
    project: projectId,
  }).populate("user", "name email roleInProject");

  const tasks = await Task.find({ project: projectId })
    .populate("assignedTo", "name email")
    .populate("project", "title");

  const result = assignments.map((assignment) => {
    const memberTasks = tasks.filter(
      (task) =>
        task.assignedTo?._id.toString() === assignment.user._id.toString()
    );

    return {
      user: assignment.user,
      roleInProject: assignment.roleInProject,
      tasks: memberTasks,
    };
  });

  res.json(result);
});
const createTask = asyncHandler(async (req, res) => {
  const { projectId, title, description, dueDate, assignedTo } = req.body;

  const task = await Task.create({
    project: projectId,
    title,
    description,
    status: "todo",
    dueDate,
    assignedTo,
  });

  return res.status(201).json(task);
});

module.exports = {
  getTasksByProject,
  createTask,
};
