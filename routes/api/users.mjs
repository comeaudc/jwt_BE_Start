import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import User from "../../models/User.mjs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// @route:   POST api/users
// @desc:    Registering a User
// @access:  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
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
    const { name, email, password } = req.body;

    // Try
    try {
      // check if user exists
      let user = await User.findOne({ email });

      // if user exists, res with error
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already Exists" }] });
      }

      // create user
      user = new User({
        name,
        email,
        password,
      });

      // encrypt password
      //create salt - specifies the amount of encyption
      const salt = await bcrypt.genSalt(10);
      // encrypting the users password
      user.password = await bcrypt.hash(password, salt);

      // save user to DB
      await user.save();

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
          expiresIn: 3600000,
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
