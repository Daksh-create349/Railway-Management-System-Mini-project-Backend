const express=require("express");
const router=express.Router();

const {
createTrain,
getTrains,
getSeatAvailability,
updateTrain,
deleteTrain
}=require("../controllers/trainController");

const auth=require("../middleware/authMiddleware");
const role=require("../middleware/roleMiddleware");


router.post(
"/",
auth,
role("admin"),
createTrain
);


router.get(
"/",
getTrains
);


router.get(
"/:id/seats",
getSeatAvailability
);


router.put(
"/:id",
auth,
role("admin","staff"),
updateTrain
);


router.delete(
"/:id",
auth,
role("admin"),
deleteTrain
);


module.exports=router;