const express = require("express");
const app = express();

app.use("/test" , (req,res)=>{
    res.send("Hello From the server");
})
app.use("/" , (req,res)=>{
    res.send("Hello From the Dashboard");
})


app.listen(7777 , ()=>{
    console.log("Server is listening to Port 7777...");
})