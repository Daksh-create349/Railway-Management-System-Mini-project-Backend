const express=require("express");
const dotenv=require("dotenv");
const cors=require("cors");

const connectDB=require("./config/db");

const authRoutes=require("./routes/authRoutes");
const trainRoutes=require("./routes/trainRoutes");
const bookingRoutes=require("./routes/bookingRoutes");
const adminRoutes=require("./routes/adminRoutes");
const notificationRoutes=require("./routes/notificationRoutes");
const statusRoutes=require("./routes/statusRoutes");
const stationRoutes=require("./routes/stationRoutes");
const passengerRoutes=require("./routes/passengerRoutes");

const errorMiddleware=require("./middleware/errorMiddleware");


dotenv.config();

connectDB();


const app=express();


app.use(cors());

app.use(express.json());


app.use("/api/auth",authRoutes);

app.use("/api/trains",trainRoutes);

app.use("/api/bookings",bookingRoutes);

app.use("/api/admin",adminRoutes);

app.use("/api/notifications",notificationRoutes);

app.use("/api/status",statusRoutes);

app.use("/api/stations",stationRoutes);

app.use("/api/passengers",passengerRoutes);



app.get("/",(req,res)=>{

res.send("Smart Railway Backend Running");

});


app.use(errorMiddleware);



const PORT=process.env.PORT||5000;


app.listen(PORT,()=>{

console.log(`Server running on ${PORT}`);

});