import express from "express";
import User from "../../models/User.mjs";
import auth from "../../middleware/auth.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// @route:   GET api/auth
// @desc:    Get User information if signed in
// @access:  Private
router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route:   GET api/auth
// @desc:    Login User
// @access:  Public
router.post(
  "/",
  [
    check("email", "Please include a valid email.").isEmail(),
    check("password", "Password Required").not().isEmpty(),
  ],
  async (req, res) => {
    // Validate req data
    // Check is any validationResults
    const errors = validationResult(req);

    // if error
    if (!errors.isEmpty()) {
      // res with error
      return res.status(400).json({ errors: errors.array() });
    }

    //destructure req body for effciency
    const { email, password } = req.body;

    try {
      // find user by email
      let user = await User.findOne({ email });

      //if no user, res with error
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //   compare passwords
      const isMatch = await bcrypt.compare(password, user.password);

      // if password dont match
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // create our payload - userId
      const payload = {
        user: {
          id: user._id,
        },
      };

      // create a JWT
      jwt.sign(
        payload,
        process.env.jwtSecret,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;

          // send jwt to FrontEnd
          res.status(201).json({ token });
        }
      );

    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

export default router;
