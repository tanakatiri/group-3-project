import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { seedAdmin } from "./seed-admin.js";
import { seedTestUsers } from "./seed-test-users.js";
import houseRoutes from "./routes/houseRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import rentalApplicationRoutes from "./routes/rentalApplicationRoutes.js";
import rentalCalculationRoutes from "./routes/rentalCalculationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import eventLogRoutes from "./routes/eventLogRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB and seed admin
const initializeApp = async () => {
  try {
    console.log('🔧 Initializing application...');
    await connectDB();
    console.log('⏳ Waiting for MongoDB to be fully ready...');
    // Wait longer for MongoDB to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('👨‍💼 Creating admin account...');
    await seedAdmin();
    console.log('👥 Creating test users...');
    await seedTestUsers();
    console.log('✅ Application initialized successfully!');
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
  }
};

initializeApp();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/houses", houseRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/rental-applications", rentalApplicationRoutes);
app.use("/api/rental-calculations", rentalCalculationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/event-logs", eventLogRoutes);
app.use("/api/payments", paymentRoutes);

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/landlord", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landlord.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/tenant", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tenant.html"));
});

app.get("/portal", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "portal.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});
