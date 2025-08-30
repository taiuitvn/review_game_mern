import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  savePost,
  updatePostById,
  removePostById,
  getPostByTitle,
} from "../controllers/post.controller.js";
import { auth } from "../middleware/auth.js";
const post_router = express.Router();

post_router.get("/list", getAllPosts);
post_router.get("/:id", getPostById);
post_router.post("/update/:id", updatePostById);
post_router.post("/remove/:id", removePostById);
post_router.post("/", createPost);
post_router.put("/:id/like", auth, likePost);
post_router.post("/:id/save", auth, savePost);
post_router.get("/search/:title", getPostByTitle);

export default post_router;
