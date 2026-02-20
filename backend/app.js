import express from "express"
import cookieParser from "cookie-parser";

const app = express();

export {app};

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRoutes from "./routes/user.routes.js"

//routes declaration
app.use("/user", userRoutes);