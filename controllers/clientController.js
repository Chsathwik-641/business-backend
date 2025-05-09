const asyncHandler = require("express-async-handler");
const Client = require("../models/client");

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().populate("addedBy", "name email");
  res.json(clients);
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).populate(
    "addedBy",
    "name email"
  );

  if (client) {
    res.json(client);
  } else {
    res.status(404);
    throw new Error("Client not found");
  }
});

// @desc    Create a client
// @route   POST /api/clients
// @access  Private (Admin/Manager)
const createClient = asyncHandler(async (req, res) => {
  const { name, email, company } = req.body;

  const clientExists = await Client.findOne({ email });

  if (clientExists) {
    res.status(400);
    throw new Error("Client already exists");
  }

  const client = await Client.create({
    name,
    email,
    company,
    addedBy: req.user._id,
  });

  if (client) {
    res.status(201).json(client);
  } else {
    res.status(400);
    throw new Error("Invalid client data");
  }
});

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private (Admin/Manager)
const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (client) {
    client.name = req.body.name || client.name;
    client.email = req.body.email || client.email;
    client.company = req.body.company || client.company;

    const updatedClient = await client.save();
    res.json(updatedClient);
  } else {
    res.status(404);
    throw new Error("Client not found");
  }
});

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  // console.log("delete client req:", client);
  if (client) {
    await client.deleteOne();
    res.json({ message: "Client removed" });
  } else {
    res.status(404);
    throw new Error("Client not found");
  }
});

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};
