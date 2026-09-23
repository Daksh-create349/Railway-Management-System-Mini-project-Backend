const mongoose=require("mongoose");

const notificationSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    trainId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Train"
    },
    message:String,
    type:String,
    read:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

module.exports=mongoose.model("Notification",notificationSchema);
