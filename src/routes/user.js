const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");

// const USER_SAFE_DATA = "firstName lastName";
const USER_SAFE_DATA =
  "firstName lastName emailId photoUrl about skills createdAt age gender";

// To get all the pending request for logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // }).populate("fromUserId" , ["firstName" , "lastName"])

    if (requests.length === 0) {
      return res.json({ message: "No Pending request found" });
    }

    res.json({ message: "All Pending Requests", data: requests });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const allConnections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser, status: "accepted" },
        { fromUserId: loggedInUser, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = allConnections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });

    res.json({ message: "All Connections", data: data });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .select("firstName lastName status")
      .populate("fromUserId", "firstName")
      .populate("toUserId", "firstName");

    const hideUserFromFeed = new Set();
    connectionRequests.forEach((req) => {
      if (req.fromUserId && req.fromUserId._id) {
        hideUserFromFeed.add(req.fromUserId._id.toString());
      }
      if (req.toUserId && req.toUserId._id) {
        hideUserFromFeed.add(req.toUserId._id.toString());
      }
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ message: "Feed fetched successfully", data: users });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// userRouter.delete("/user", async (req, res) => {
//   const userId = req.body.userId;
//   try {
//     await User.findByIdAndDelete(userId);
//     res.send("User Deleted Sucessfully");
//   } catch (error) {
//     res.status(500).send("something went wrong");
//   }
// });

// userRouter.patch("/user/:userId", async (req, res) => {
//   const userId = req.params.userId;
//   console.log("userId", userId);

//   const data = req.body;

//   try {
//     const ALLOWED_UPDATE = ["photoUrl", "about", "gender", "age", "skills"];

//     const isUpdateAllowed = Object.keys(data).every((k) => {
//       ALLOWED_UPDATE.includes(k);
//     });

//     if (!isUpdateAllowed) {
//       throw new Error("Update Not Allowed");
//     }
//     const user = await User.findByIdAndUpdate({ _id: userId }, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     console.log(user);
//     res.send("User updated successfully");
//   } catch (err) {
//     res.status(400).send("Something went wrong: " + err.message);
//   }
// });

module.exports = userRouter;
