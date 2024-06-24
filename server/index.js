// Imports --------------------------------------------------------
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
// -----------------------------------------------------------------

// Constants ------------------------------------------------------
const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);
// -----------------------------------------------------------------

// Configurations -------------------------------------------------
dotenv.config();
mongoose.connect(process.env.MONGO_URL);
// -----------------------------------------------------------------

// Middleware ------------------------------------------------------
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(cookieParser());
// -----------------------------------------------------------------

// Routes ----------------------------------------------------------

// To check if the user is logged in -------------------------------
app.get("/profile", (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) {
        throw err;
      }
      userData.valid = true;
      res.json(userData);
    });
  } else {
    res.json({ valid: false, message: "No user logged in." });
  }
});
// -----------------------------------------------------------------

// To login the user -----------------------------------------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });

  if (foundUser) {
    const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);

    if (isPasswordCorrect) {
      jwt.sign(
        { userId: foundUser._id, username: username, valid: true },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(200)
            .json({
              id: foundUser._id,
              valid: true,
            });
        }
      );
    } else {
      res.json({
        message: "Incorrect Password",
        valid: false,
      });
    }
  } else {
    res.json({
      message: "User not found",
      valid: false,
    });
  }
});
// -----------------------------------------------------------------

// To create a new user --------------------------------------------
app.post("/signup", async (req, res) => {
  const { name, username, password } = req.body;
  const foundUser = await User.findOne({ username });

  if (foundUser) {
    res.json({
      message: "User already exists.",
      valid: false,
    });
  } else {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const newUser = await User.create({
      name: name,
      username: username,
      password: hashedPassword,
    });

    jwt.sign(
      { userId: newUser._id, username },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: newUser._id,
            valid: true,
          });
      }
    );
  }
});
// -----------------------------------------------------------------

// Main Server -----------------------------------------------------
const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
// -----------------------------------------------------------------

// Create WebSocket Server ----------------------------------------
const wss = new ws.Server({ server });
wss.on("connection", (connection, req) => {
  console.log("WebSocket connected");

  const cookies = req.headers.cookie;

  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((cookie) => cookie.startsWith("token="));

    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];

      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) {
            throw err;
          }

          const { userId, username } = userData;

          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
