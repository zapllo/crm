import mongoose from 'mongoose';

async function connectDB() {
  const dbURI = process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI;

  if (!dbURI) {
    console.error('MongoDB connection URI is missing. Please check your environment variables.');
    process.exit(1); // Exit process with failure
  }

  try {
    await mongoose.connect(dbURI, {});
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
}

export default connectDB;
