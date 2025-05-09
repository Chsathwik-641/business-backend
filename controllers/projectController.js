const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
// const Client = require("../models/client")
const Client = require("../models/Client");
const User = require("../models/User");
const Task = require("../models/Task");
const TeamAssignment = require("../models/TeamAssignment");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate("client", "name email company")
    .populate("manager", "name email");

  res.json(projects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("client", "name email company")
    .populate("manager", "name email");

  if (project) {
    res.json(project); // Directly return project without role-based checks
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin/Manager)
// const createProject = asyncHandler(async (req, res) => {
//   const { title, description, startDate, endDate, status } = req.body;

//   const project = await Project.create({
//     title,
//     description,
//     status,
//     startDate,
//     endDate,
//     manager: req.user._id, // Automatically assign the logged-in user as manager
//   });

//   if (project) {
//     res.status(201).json(project);
//   } else {
//     res.status(400);
//     throw new Error("Invalid project data");
//   }
// });
const createProject = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, status, manager } = req.body;

  if (!manager) {
    res.status(400);
    throw new Error("Project manager is required");
  }

  const project = await Project.create({
    title,
    description,
    status,
    startDate,
    endDate,
    manager, // 👈 assigned from frontend selection
  });

  if (project) {
    res.status(201).json(project);
  } else {
    res.status(400);
    throw new Error("Invalid project data");
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Manager)
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    // console.log("project ", project, req.user);
    // Check if the user is the manager or admin
    if (req.user.role !== "admin" && !project.manager.equals(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to update this project");
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.status = req.body.status || project.status;
    project.startDate = req.body.startDate || project.startDate;
    project.endDate = req.body.endDate || project.endDate;

    if (req.body.client) {
      const clientExists = await Client.findById(req.body.client);
      if (!clientExists) {
        res.status(400);
        throw new Error("Client not found");
      }
      project.client = req.body.client;
    }

    if (req.user.role === "admin" && req.body.manager) {
      const managerExists = await User.findById(req.body.manager);
      if (!managerExists || managerExists.role !== "manager") {
        res.status(400);
        throw new Error("Manager not found or invalid role");
      }
      project.manager = req.body.manager;
    }

    if (req.body.hasTeam) {
      project.hasTeam = req.body.hasTeam;
      project.status = req.body.status;
    }

    if (req.body.task) {
      project.task = req.body.task;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await project.deleteOne();
    res.json({ message: "Project removed" });
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

// @desc    Get tasks for a project
// @route   GET /api/projects/:id/tasks
// @access  Private
const getProjectTasks = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    // Check if user has access to this project
    if (req.user.role === "admin" || project.manager._id.equals(req.user._id)) {
      const tasks = await Task.find({ project: project._id }).populate(
        "assignedTo",
        "name email"
      );
      res.json(tasks);
    } else {
      // Check if user is assigned to this project
      const assignment = await TeamAssignment.findOne({
        project: project._id,
        user: req.user._id,
      });
      if (assignment) {
        const tasks = await Task.find({
          project: project._id,
          assignedTo: req.user._id,
        }).populate("assignedTo", "name email");
        res.json(tasks);
      } else {
        res.status(403);
        throw new Error("Not authorized to access tasks for this project");
      }
    }
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  // getProjectTasks,
};
