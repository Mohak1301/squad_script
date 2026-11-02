import cron from "node-cron";
import usermodel from "../models/usermodel.js";
import filemodel from "../models/filemodel.js";
import meetmodel from "../models/meetmodel.js";

const scheduleOptions = { timezone: process.env.CRON_TIMEZONE || "UTC", noOverlap: true };

if (process.env.NODE_ENV !== "test") cron.schedule("0 0 * * *", async () => {
  const now = Date.now();
  const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  try {
    await Promise.all([
      usermodel.updateMany({ isVerified: true, lastVerified: { $lt: sixMonthsAgo } }, { $set: { isVerified: false } }),
      usermodel.deleteMany({ isVerified: false, lastVerified: { $lt: oneMonthAgo } }),
      filemodel.deleteMany({ createdAt: { $lt: oneDayAgo } }),
      meetmodel.deleteMany({ createdAt: { $lt: oneDayAgo } }),
    ]);
  } catch (error) {
    console.error("Scheduled cleanup failed:", error.message);
  }
}, scheduleOptions);
