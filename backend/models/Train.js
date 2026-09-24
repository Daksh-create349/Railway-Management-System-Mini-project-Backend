const mongoose=require("mongoose");

const trainSchema=new mongoose.Schema({
    trainNumber:{
        type:String,
        required:true,
        unique:true
    },
    trainName:{
        type:String,
        required:true
    },
    source:String,
    destination:String,
    totalSeats:Number,
    availableSeats:Number,
    status:{
        type:String,
        default:"Scheduled"
    }
});

module.exports=mongoose.model("Train",trainSchema);
