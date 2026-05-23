import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB холбогдлоо: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB холбогдох алдаа:", err.message);
    process.exit(1);
  }
};

export default connectDB;