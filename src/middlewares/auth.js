const jwt = require("jsonwebtoken");
const User = require("../models/user");
const USER_SAFE_DATA = "firstName lastName emailId photoUrl about skills createdAt age gender";

const userAuth = async (req, res, next) => {
  // Read the token from req.cookies
  // validate the token
  // decode the details from the token and find the user

  try {
    const cookies = req.cookies;
    const { AuthToken } = cookies;
    if (!AuthToken) {
      res.status(401).json({message : "User Not Authorized"})
    }
    const decoded = await jwt.verify(AuthToken, "Ankit@2002");
    const user = await User.findById({ _id: decoded._id }).select(USER_SAFE_DATA);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("ERROR : " + error.message);
  }
};

module.exports = {
  userAuth,
};
