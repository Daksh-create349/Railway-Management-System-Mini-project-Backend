const express=require("express");
const { body } = require("express-validator");
const router=express.Router();

const {
register,
login
}=require("../controllers/authController");

const validate=require("../middleware/validationMiddleware");


router.post(
"/register",
[
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
],
validate,
register
);


router.post(
"/login",
[
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
],
validate,
login
);


module.exports=router;
