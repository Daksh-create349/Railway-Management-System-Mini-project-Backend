const mongoose=require("mongoose");

const passengerSchema=new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    age:Number,
    gender:String,
    phone:String
});

module.exports=mongoose.model("Passenger",passengerSchema);
