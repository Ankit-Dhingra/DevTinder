const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
const User = require("./models/user.js");
const { validateSignupData } = require("./utils/validation.js");
const bcrypt = require("bcrypt");
const CookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth.js");
const cors = require("cors");
const http = require('http');
const initializeSocket = require('./utils/socket.js');

require("dotenv").config();

const webhookRouter = require("./routes/webhook.js");
app.use("/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(CookieParser());

// Import all the routes

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const paymentRouter = require("./routes/payment.js");
const chatRouter = require("./routes/chat.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("MongoDB Connected successfully...");
    server.listen(process.env.PORT, () => {
      console.log("Server is listening to Port 7777...");
    });
  })
  .catch((err) => {
    console.log("Error connecting MongoDB :", err);
  });
