import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function (req, res, next) {
  // Get token from req.header
  const token = req.header("x-auth-token");

  //if no token
  if (!token) {
    return res.status(401).json({ errors: [{ msg: "No Token, Auth Denied" }] });
  }

  // try
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);

    // create user prop on req and store
    req.user = decoded.user;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ errors: [{ msg: "Token is not Valid" }] });
  }
}
