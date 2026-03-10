import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./database/index.js";
import { startSeatCleanupJob } from "./utils/seatCleanup.service.js";

dotenv.config({
  path: ".env",
});

await connectDB()
  .then(() => {
    startSeatCleanupJob(); //start cleanup cron job on successful db connection
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Server failed to load", error);
  });

