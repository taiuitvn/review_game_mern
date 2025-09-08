import express from "express";
import cors from "cors";
import post_router from "./routers/posts.router.js";
import auth_router from "./routers/auth.router.js";
import comments_router from "./routers/comment.router.js";
import notify_router from "./routers/notifications.router.js";
import router_upload from "./routers/upload.router.js";
import rating_router from "./routers/rating.router.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from "./swagger.js";
dotenv.config();
const app = express();

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://localhost:3000',
      'https://localhost:5173', 

      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow any vercel.app domain
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

//connect mongoose
mongoose
  .connect(process.env.MOVIE_REVIEWS_APP_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("<h1>Game Hub API is running!</h1>");
});

// API routes with /api prefix for Vercel
app.use("/api/auth", auth_router);
app.use("/api/posts", post_router);
app.use("/api/comments", comments_router);
app.use("/api/notifications", notify_router);
app.use("/api/rating", rating_router);
app.use("/api/upload", router_upload);

export default app;
