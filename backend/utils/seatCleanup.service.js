import { Seat } from "../models/seat.models.js";
import cron from "node-cron";

export const startSeatCleanupJob = async () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running periodic expired seat cleanup job");

    await Seat.updateMany(
      {
        status: "LOCKED",
        lockExpiry: { $lt: new Date() },
      },
      {
        $set: {
          status: "AVAILABLE",
          lockedBY: null,
          lockExpiry: null,
        },
      },
    );
  });
};
