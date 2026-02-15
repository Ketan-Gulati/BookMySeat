import { app } from "./app.js";
import { connectDB } from "./database/index.js";
import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
})

await connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Server failed to load", error);
})

