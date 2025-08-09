const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignupData } = require("../utils/validation.js");

const USER_SAFE_DATA =
  "firstName lastName emailId photoUrl about skills createdAt age gender password isPremium";

authRouter.post("/signup", async (req, res) => {
  try {
    //Creating a new  Instance of the User Model
    validateSignupData(req);

    // Now we need to encrypt our password before storing it in DB
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body["password"] = hashedPassword;
    const user = new User(req.body);
    await user.save();
    console.log("Data Saved Successfully");
    const token = await user.getJWT();
    const userObj = user.toObject();
    delete userObj.password;
    res.cookie("AuthToken", token , {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.status(200).json({ message: "User created successfully", data: userObj });
  } catch (error) {
    res.status(400).send("Error saving data :" + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId }).select(
      USER_SAFE_DATA
    );
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Password");
    }
    const token = await user.getJWT();
    const userObj = user.toObject();
    delete userObj.password;
    res.cookie("AuthToken", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.status(200).json({ message: "User login successfully", data: userObj });
  } catch (error) {
    res.status(400).send("ERROR :  " + error.message);
  }
});

authRouter.get("/logout", (req, res) => {
  res.cookie("AuthToken", null, {
    expires: new Date(Date.now()),
  });

  res.send("Logout successfully!");
});

module.exports = authRouter;
