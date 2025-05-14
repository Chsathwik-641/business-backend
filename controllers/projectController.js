const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const Client = require("../models/Client");
const User = require("../models/User");
const Task = require("../models/Task");
const TeamAssignment = require("../models/TeamAssignment");

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate("client", "name email company")
    .populate("manager", "name email");

  res.json(projects);
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("client", "name email company")
    .populate("manager", "name email");

  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error("Project not found");
  }
});

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
    manager,
  });

  if (project) {
    res.status(201).json(project);
  } else {
    res.status(400);
    throw new Error("Invalid project data");
  }
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
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

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
