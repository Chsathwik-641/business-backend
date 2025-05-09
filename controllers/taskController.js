const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const Project = require("../models/Project");
// const User = require("../models/User");
const TeamAssignment = require("../models/TeamAssignment");

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Check if user has access to this project
  if (req.user.role !== "admin" && !project.manager.equals(req.user._id)) {
    // Check if user is assigned to this project
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

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/me
// @access  Private
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("project", "title status")
    .populate("assignedTo", "name email");

  res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin/Manager)
const createTask = asyncHandler(async (req, res) => {
  const { projectId, title, description, /*assignedTo,*/ dueDate } = req.body;

  // Verify project exists
  console.log("came here projectID", projectId, title, description, dueDate);
  const project = await Project.findById(projectId);
  console.log("project found:", project);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Check if user is the manager or admin
  // if (req.user.role !== "admin" && !project.manager.equals(req.user._id)) {
  //   res.status(403);
  //   throw new Error("Not authorized to create tasks for this project");
  // }
  // if (req.user.role !== "admin") {
  //   res.status(403);
  //   throw new Error("Not authorized to create tasks for this project");
  // }

  // Verify assigned user exists and is a team member
  // const user = await User.findById(assignedTo);
  // if (!user || user.role !== "team-member") {
  //   res.status(400);
  //   throw new Error("User not found or not a team member");
  // }

  // Verify user is assigned to the project
  // const assignment = await TeamAssignment.findOne({
  //   project: projectId,
  //   user: assignedTo,
  // });
  // if (!assignment) {
  //   res.status(400);
  //   throw new Error("User is not assigned to this project");
  // }

  const task = await Task.create({
    project: projectId,
    title,
    description,
    status: "todo",
    dueDate,
  });

  res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
// const updateTask = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.id).populate(
//     "project",
//     "manager"
//   );

//   if (!task) {
//     res.status(404);
//     throw new Error("Task not found");
//   }

//   // Check if user is the assignee, manager, or admin
//   if (
//     req.user.role !== "admin" &&
//     !task.project.manager.equals(req.user._id) &&
//     !task.assignedTo.equals(req.user._id)
//   ) {
//     res.status(403);
//     throw new Error("Not authorized to update this task");
//   }

//   // Only managers/admins can change assignee
//   if (req.body.assignedTo) {
//     if (
//       req.user.role === "admin" ||
//       task.project.manager.equals(req.user._id)
//     ) {
//       const user = await User.findById(req.body.assignedTo);
//       if (!user || user.role !== "team-member") {
//         res.status(400);
//         throw new Error("User not found or not a team member");
//       }
//       task.assignedTo = req.body.assignedTo;
//     } else {
//       res.status(403);
//       throw new Error("Not authorized to change task assignment");
//     }
//   }

//   task.title = req.body.title || task.title;
//   task.description = req.body.description || task.description;
//   task.status = req.body.status || task.status;
//   task.dueDate = req.body.dueDate || task.dueDate;

//   const updatedTask = await task.save();
//   res.json(updatedTask);
// });

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Manager)
// const deleteTask = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.id).populate(
//     "project",
//     "manager"
//   );

//   if (!task) {
//     res.status(404);
//     throw new Error("Task not found");
//   }

//   // Check if user is the manager or admin
//   if (req.user.role !== "admin" && !task.project.manager.equals(req.user._id)) {
//     res.status(403);
//     throw new Error("Not authorized to delete this task");
//   }

//   await task.remove();
//   res.json({ message: "Task removed" });
// });

module.exports = {
  getTasksByProject,
  createTask,
};
