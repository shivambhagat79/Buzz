// Imports --------------------------------------------------------
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/Message");
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

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

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

app.post("/logout", (req, res) => {
  res
    .cookie("token", "", { sameSite: "none", secure: true })
    .json({ status: "ok " });
});

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

// To get messages of a user ---------------------------------------
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;

  const messages = await Message.find({
    sender: { $in: [ourUserId, userId] },
    recipient: { $in: [ourUserId, userId] },
  }).sort({ createdAt: 1 });

  res.json(messages);
});
// -----------------------------------------------------------------

app.get("/users", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

// Main Server -----------------------------------------------------
const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
// -----------------------------------------------------------------

// Create WebSocket Server ----------------------------------------
const wss = new ws.Server({ server });
wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
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
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log("dead");
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

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

  notifyAboutOnlinePeople();

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    console.log(messageData);

    const { recipient, text } = messageData;

    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient: recipient,
        text: text,
      });

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) => {
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDoc._id,
            })
          );
        });
    }
  });
});
// -----------------------------------------------------------------

wss.on("close", (data) => {
  console.log("WebSocket closed");
  console.log(data);
});
