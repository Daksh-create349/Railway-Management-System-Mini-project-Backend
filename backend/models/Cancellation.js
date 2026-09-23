const mongoose=require("mongoose");

const cancellationSchema=new mongoose.Schema({
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking"
    },
    pnr:String,
    reason:String,
    refundAmount:Number,
    cancelledAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model("Cancellation",cancellationSchema);
