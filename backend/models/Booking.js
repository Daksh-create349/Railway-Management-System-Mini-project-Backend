const mongoose=require("mongoose");

const bookingSchema=new mongoose.Schema({
    pnr:{
        type:String,
        unique:true
    },
    passengerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Passenger"
    },
    trainId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Train"
    },
    source:String,
    destination:String,
    journeyDate:Date,
    seatNumber:String,
    status:{
        type:String,
        default:"Confirmed"
    },
    fare:Number
},{
    timestamps:true
});

module.exports=mongoose.model("Booking",bookingSchema);
