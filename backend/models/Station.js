const mongoose=require("mongoose");

const stationSchema=new mongoose.Schema({
    stationCode:{
        type:String,
        required:true,
        unique:true
    },
    stationName:{
        type:String,
        required:true
    },
    city:String,
    state:String
});

module.exports=mongoose.model("Station",stationSchema);
