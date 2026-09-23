const express=require("express");

const router=express.Router();


const {
getNotifications,
createNotification
}=require("../controllers/notificationController");


const auth=require("../middleware/authMiddleware");


router.get(
"/",
auth,
getNotifications
);


router.post(
"/",
auth,
createNotification
);


module.exports=router;
