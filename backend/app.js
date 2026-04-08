import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

export {app};

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import routes
import userRoutes from "./routes/user.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import healthRoute from "./routes/health.routes.js"

//routes declaration
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/payments", paymentRoutes);
app.use("/api/v1", healthRoute);