import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    if (!process.env.MONGOURL) {
      if (process.env.NODE_ENV === "production") throw new Error("MONGOURL is required");
      console.warn("MONGOURL is not configured; database connection skipped.");
      return null;
    }
    const conn = await mongoose.connect(process.env.MONGOURL, {
      serverSelectionTimeoutMS: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
      maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE || 10),
    });
    console.log(`Connected successfully to mongodb `.bgGreen.white);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.bgRed.white);
    if (process.env.NODE_ENV === "production") process.exit(1);
    return null;
  }
};

export default connectDB;
