const User=require("../models/User");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const register=async(req,res,next)=>{
    try{
        const {name,email,password,role}=req.body;

        const existingUser=await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                message:"User already exists"
            });
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const user=await User.create({
            name,
            email,
            password:hashedPassword,
            role
        });

        res.status(201).json({
            message:"Registration successful",
            user
        });

    }catch(error){
        next(error);
    }
};


const login=async(req,res,next)=>{
    try{

        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }


        const match=await bcrypt.compare(
            password,
            user.password
        );


        if(!match){
            return res.status(401).json({
                message:"Invalid password"
            });
        }


        const token=jwt.sign(
            {
                id:user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );


        res.json({
            message:"Login successful",
            token,
            role:user.role
        });


    }catch(error){
        next(error);
    }
};


module.exports={
    register,
    login
};
