const mongoose = require("mongoose");

const teamAssignmentSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleInProject: {
      type: String,
      enum: ["manager", "developer", "designer", "qa"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TeamAssignment = mongoose.model("TeamAssignment", teamAssignmentSchema);

module.exports = TeamAssignment;
