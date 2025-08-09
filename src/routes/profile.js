const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const profileRouter = express.Router();
const { validateProfileEditData } = require("../utils/validation");
const USER_SAFE_DATA = "firstName lastName emailId photoUrl about skills createdAt age gender password isPremium";


profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({data : user});
  } catch (err) {
    res.status(400).send("Error fetching profile : " + err);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid fields passed for edit");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();

    res.json({message : "Profile Updated Successfully" , data : loggedInUser});
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

// API to Get Single user by Id
profileRouter.post("/user", async (req, res) => {
  const email = req.body.emailId;
  const user = await User.find({ emailId: email });
  res.send({ data: user });
});

// Feed API - GET /feed - To get All the Users from Database
profileRouter.get("/feed", userAuth, async (req, res) => {
  const allUser = await User.find({});
  res.send({ msg: "All Users Fetched Successfully", data: allUser });
});

module.exports = profileRouter;
