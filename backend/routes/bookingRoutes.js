const express=require("express");

const router=express.Router();


const {
createBooking,
getBookingByPNR,
getJourneyHistory,
getAllBookings
}=require("../controllers/bookingController");


const {
cancelBooking
}=require("../controllers/cancellationController");


const auth=require("../middleware/authMiddleware");
const { body }=require("express-validator");
const validate=require("../middleware/validationMiddleware");


router.post(
"/",
auth,
[
  body("trainId").notEmpty().withMessage("trainId is required"),
  body("passengerId").notEmpty().withMessage("passengerId is required")
],
validate,
createBooking
);



router.get(
"/pnr/:pnr",
getBookingByPNR
);



router.get(
"/history/:id",
auth,
getJourneyHistory
);



router.get(
"/",
auth,
getAllBookings
);



router.put(
"/cancel/:id",
auth,
cancelBooking
);



module.exports=router;
