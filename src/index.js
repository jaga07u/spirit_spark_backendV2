import { app } from "./app.js"
import connectDB from "./db/index.js";
import "dotenv/config"
connectDB();
app.listen(process.env.PORT || 4000,()=>{
    console.log("App listen At 4000 port");
})