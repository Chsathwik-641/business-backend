const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.route("/register").post(authController.registerUser);
router.route("/login").post(authController.loginUser);
router.route("/profile").get(protect, authController.getUserProfile);

module.exports = router;
// ``;
