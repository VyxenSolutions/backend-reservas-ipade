const express = require("express");
const {
  completeOnboarding,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  searchUsersByEmail,
  getProfile
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.patch("/onboarding", protect, completeOnboarding);
router.get('/profile', protect, getProfile);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/", createUser); // opcional
router.get('/search/email', protect, searchUsersByEmail);

module.exports = router;
