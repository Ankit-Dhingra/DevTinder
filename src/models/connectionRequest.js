const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  //reference to the user collection
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: {
            values: ["ignored" , "interested" , "accepted" , "rejected"],
            message: `{value} is incorrect status type`,
        }
    },
},
{
    timestamps: true
});

connectionRequestSchema.index({fromUserId : 1, toUserId : 1});

connectionRequestSchema.pre("save" , function(next){
    const connectionRequest = this;
    // Check if from userId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("cannot send request to yourself !! (PRE)")
    }
    next();
})

const connectionRequestModel = new mongoose.model("ConnectionRequest" , connectionRequestSchema);

module.exports = connectionRequestModel;