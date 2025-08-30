import express from "express";
import {
  getCommentByPostId,
  removeCommentById,
  createComment,
  editCommentById,
  likeComment,
} from "../controllers/comment.controller.js";
import { auth } from "../middleware/auth.js";
const comments_router = express.Router();

comments_router.get("/:id", getCommentByPostId);
comments_router.post("/like/:id", auth, likeComment);
comments_router.delete("/remove/:id", removeCommentById);
comments_router.put("/edit/:id", editCommentById);
comments_router.post("/", createComment);

export default comments_router;
