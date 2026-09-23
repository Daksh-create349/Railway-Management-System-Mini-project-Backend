const Notification=require("../models/Notification");


const getNotifications=async(req,res,next)=>{

try{

const notifications=await Notification.find({
userId:req.user.id
})
.sort({
createdAt:-1
});


res.json(notifications);


}
catch(error){
next(error);
}

};



const createNotification=async(req,res,next)=>{

try{


const notification=await Notification.create(req.body);


res.status(201).json(notification);


}
catch(error){
next(error);
}

};


module.exports={
getNotifications,
createNotification
};
