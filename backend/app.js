import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";

const app = express();


app.use(cors({
    origin: ["http://localhost:5173",
        "https://book-my-seat-weld.vercel.app"
    ],
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

//for fallback load
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Static frontend (after routes)
app.use(express.static(path.join(__dirname, "../client/dist")));
// SPA fallback (LAST ALWAYS)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

export {app};