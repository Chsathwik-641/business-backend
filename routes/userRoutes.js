const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router
  .route("/")
  .post(protect, userController.registerUser)
  .get(protect, userController.getUsers);

router
  .route("/profile")
  .get(protect, userController.getUserProfile)
  .put(protect, userController.updateUserProfile);

router
  .route("/:id")
  .get(protect, userController.getUserById)
  .put(protect, userController.updateUser)
  .delete(protect, userController.deleteUser);

module.exports = router;
