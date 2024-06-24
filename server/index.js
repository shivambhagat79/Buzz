const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);

dotenv.config();
mongoose.connect(process.env.MONGO_URL);

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(cookieParser());

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

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
