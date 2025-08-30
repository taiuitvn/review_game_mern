import express from "express";
import {
  getAllUsers,
  getUserById,
  login,
  register,
  removeById,
} from "../controllers/auth.controller.js";

const auth_router = express.Router();

auth_router.get("/users", getAllUsers);
auth_router.get("/:id", getUserById);
auth_router.post("/register", register);
auth_router.post("/login", login);
auth_router.post("/remove/:id", removeById);

export default auth_router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTIyZGQ3ZDAwNWY4ODRkMGVjNGU5YSIsImlhdCI6MTc1NDQxMzM2OSwiZXhwIjoxNzU1MDE4MTY5fQ.x-PlVub0x8Ojx5OExRo2ExFumTwniw7zPlRfHcxD4Qs
