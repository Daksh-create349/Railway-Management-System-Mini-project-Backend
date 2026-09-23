const express=require("express");

const router=express.Router();

const {
dashboard
}=require("../controllers/adminController");


const auth=require("../middleware/authMiddleware");

const role=require("../middleware/roleMiddleware");


router.get(
"/dashboard",
auth,
role("admin"),
dashboard
);


module.exports=router;
