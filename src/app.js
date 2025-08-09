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

require("dotenv").config();

const webhookRouter = require("./routes/webhook.js");
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/", webhookRouter);
app.use(express.json());
app.use(CookieParser());

// Import all the routes

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const paymentRouter = require("./routes/payment.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

connectDB()
  .then(() => {
    console.log("MongoDB Connected successfully...");
    app.listen(process.env.PORT, () => {
      console.log("Server is listening to Port 7777...");
    });
  })
  .catch((err) => {
    console.log("Error connecting MongoDB :", err);
  });
