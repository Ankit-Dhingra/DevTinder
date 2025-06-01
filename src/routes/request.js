const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "INVALID STATUS", data: null });
      };

    //   if(fromUserId == toUserId){
    //     return res.status(400).json({message : "Cannot send request to yourself!!"})
    //   }

      const userExist = await User.findById(toUserId);
      if(!userExist){
        return res.status(400).json({message: "User not found"});
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
            {fromUserId , toUserId},
            {fromUserId : toUserId , toUserId : fromUserId},
        ],
      });

      if(existingRequest){
        return res.status(400).json({message : "Connection Request Already Exists !!"})
      }


      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      const sendEmailToUser = await sendEmail.run();
      

      res.json({
        message: "Connection request has been sent successfully",
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR : " + error.message);
    }
  }
);

requestRouter.post("/request/review/:status/:requestId" , userAuth , async (req , res) => {
  try {
    const loggedInUser = req.user;
    const { status , requestId }  = req.params;

    const allowedStatus = ["accepted" , "rejected"];
    if(!allowedStatus.includes(status)){
      return res.status(400).json({message : "Status not allowed!"})
    }
    
    const connectionRequest = await ConnectionRequest.findOne({
      _id : requestId,
      toUserId : loggedInUser._id,
      status : "interested",
    });
    if (!connectionRequest) {
      return res.status(400).json({ message: "Connection request not found" });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.json({ message: `Connection request ${status}`, data: data });

    
  } catch (error) {
    console.error("Error reviewing connection request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
})

module.exports = requestRouter;
