const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const dotenv=require("dotenv");
const User=require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async()=>{

    const users=await User.find();

    for(let user of users){

        if(!user.password.startsWith("$2b$")){
            user.password=await bcrypt.hash(user.password,10);
            await user.save();
        }

    }

    console.log("Passwords converted");
    process.exit();

})
.catch(err=>{
    console.log(err);
});
