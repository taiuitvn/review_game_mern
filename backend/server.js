import express from "express";
import cors from "cors";
import post_router from "./routers/posts.router.js";
import auth_router from "./routers/auth.router.js";
import comments_router from "./routers/comment.router.js";
import notify_router from "./routers/notifications.router.js";
import router_upload from "./routers/upload.router.js";
import rating_router from "./routers/rating.router.js";
import test_router from "./routes/test.router.js";
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
    if (origin && (origin.includes('.vercel.app') || allowedOrigins.includes(origin))) {
      return callback(null, true);
    }
    
    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

// Apply CORS middleware before defining routes
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Connect to MongoDB
const mongoUri = process.env.MOVIE_REVIEWS_APP_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MongoDB URI is not defined in environment variables');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Game Hub API is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test routes
app.use("/api/test", test_router);

// API routes with /api prefix for Vercel
app.use("/api/auth", auth_router);
app.use("/api/posts", post_router);
app.use("/api/comments", comments_router);
app.use("/api/notifications", notify_router);
app.use("/api/rating", rating_router);
app.use("/api/upload", router_upload);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    message: `Cannot ${req.method} ${req.url}` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message || "Something went wrong!" 
  });
});

// Export the app for Vercel
export default app;

// Start server only when not in Vercel environment
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📄 API Documentation available at http://localhost:${port}/api-docs`);
  });
}