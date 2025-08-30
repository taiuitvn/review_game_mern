import express from "express";
import { getNotifybyUserId } from "../controllers/notification.controller.js";
const nofity_router = express.Router();

nofity_router.get("/list/:id", getNotifybyUserId);

export default nofity_router;