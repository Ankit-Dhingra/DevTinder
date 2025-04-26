const express = require("express");
const app = express();
const connectDB = require("./config/database.js")
const User = require("./models/user.js")

app.post("/signup" , async (req , res) => {
    const userObj = {
        firstName: "Ankit",
        lastName: "Dhingra",
        emailId: "ankitdhingra@gmail.com",
        password: "Ankit@2002",
        age: "22",
        gender: "Male"
    }
    // /Creating a new  Instance of the User Model
    const user = new User(userObj);
    await user.save();
    console.log("Data Saved Successfully");
    res.status(201).send("User created successfully");
})


connectDB()
  .then(() => {
    console.log("MongoDB Connected successfully...");
    app.listen(7777 , ()=>{
        console.log("Server is listening to Port 7777...");
    })
  })
  .catch((err) => {
    console.log("Error connecting MongoDB :", err);
  });


