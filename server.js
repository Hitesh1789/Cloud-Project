// Aim: Develop a Secure identity access management with back up and replicate options: Cloud apps open solution (IaaS, PaaS, and also in SaaS) Steps: Ø Choose cloud storage (bucket) Ø Develop a web interface Ø Implement a file upload/download with replicate and backup options Ø It should also have different versions i.e. V1, V2……. Ø User Authentication Ø Testing and Deployment

import connectDB from "./config/connectDB.config.js";
import {app} from "./app.js";
import dotenv from "dotenv";
dotenv.config({ 
    path:'./.env'
})
 
connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed ! ",error);
})

