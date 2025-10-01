import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// @route:   GET api/users
// @desc:    Test Route
// @access:  Public
router.route("/").get((req, res) => {
  res.send("User Test");
});

export default router;
