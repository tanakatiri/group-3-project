import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`MongoDB URI exists: ${!!process.env.MONGO_URI}`);
  console.log(`MongoDB URI starts with: ${process.env.MONGO_URI?.substring(0, 20)}...`);
});
