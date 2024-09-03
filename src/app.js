import express from "express"
import UserRoute from "./routes/User.route.js"
import PostRoute from "./routes/Post.route.js"
import LikeRoute from "./routes/Like.route.js"
import  cookieParser from 'cookie-parser'
import UserQuoteRoute from "./routes/UserQuote.route.js"
import FollowerRoute from "./routes/Follwer.route.js"
import cors from 'cors'


const app=express();
// app.get("/",(req,res)=>{
//    // console.log("Hello World!");
//     res.send("Hello World!")
// });
const corsOptions = {
    origin: `${process.env.CORS_ORIGIN}`, // Replace with your client's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions))
app.use(express.json({limit:"76kb"}))
app.use(express.urlencoded({extended:true ,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use("/api/v1/user",UserRoute);
app.use("/api/v1/post",PostRoute);
app.use("/api/v1/users/profile",UserQuoteRoute);
app.use("/api/v1/follow",FollowerRoute)
app.use("/api/v1/like",LikeRoute);
export {app};