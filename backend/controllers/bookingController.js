const Booking=require("../models/Booking");
const Train=require("../models/Train");


const createBooking=async(req,res,next)=>{

try{

const {
passengerId,
trainId,
source,
destination,
journeyDate,
seatNumber,
fare
}=req.body;


const train=await Train.findById(trainId);


if(!train){
return res.status(404).json({
message:"Train not found"
});
}


if(train.availableSeats<=0){
return res.status(400).json({
message:"No seats available"
});
}


const booking=await Booking.create({

pnr:"PNR"+Date.now(),

passengerId,
trainId,
source,
destination,
journeyDate,
seatNumber,
fare

});


train.availableSeats--;

await train.save();


res.status(201).json(booking);


}
catch(error){
next(error);
}

};



const getBookingByPNR=async(req,res,next)=>{

try{


const booking=await Booking.aggregate([

{
$match:{
pnr:req.params.pnr
}
},

{
$lookup:{
from:"passengers",
localField:"passengerId",
foreignField:"_id",
as:"passengerDetails"
}
},

{
$lookup:{
from:"trains",
localField:"trainId",
foreignField:"_id",
as:"trainDetails"
}
}

]);


res.json(booking);


}
catch(error){
next(error);
}


};



const getJourneyHistory=async(req,res,next)=>{

try{


const bookings=await Booking.find({
passengerId:req.params.id
})
.sort({
createdAt:-1
});


res.json(bookings);


}
catch(error){
next(error);
}

};



const getAllBookings=async(req,res,next)=>{

try{

const page=parseInt(req.query.page)||1;
const limit=parseInt(req.query.limit)||50;
const query={};

if(req.query.trainId){
  query.trainId=req.query.trainId;
}

const bookings=await Booking.find(query)
.populate("passengerId")
.populate("trainId")
.skip((page-1)*limit)
.limit(limit)
.sort({
createdAt:-1
});


res.json(bookings);


}
catch(error){
next(error);
}

};


module.exports={
createBooking,
getBookingByPNR,
getJourneyHistory,
getAllBookings
};
