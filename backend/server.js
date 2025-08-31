import express from "express";
import cors from "cors";
import post_router from "./routers/posts.router.js";
import auth_router from "./routers/auth.router.js";
import comments_router from "./routers/comment.router.js";
import nofity_router from "./routers/notifications.router.js";
import router_upload from "./routers/upload.router.js";
import rating_router from "./routers/rating.router.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from "./swagger.js";
dotenv.config();
const app = express();
//connect mongoose
mongoose
  .connect(process.env.MOVIE_REVIEWS_APP_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("<h1>Backend here!</h1>");
});

app.use("/auth", auth_router);
app.use("/posts", post_router);
app.use("/comments", comments_router);
app.use("/notifications", nofity_router);
app.use("/rating", rating_router);
app.use("/upload", router_upload);

export default app;
