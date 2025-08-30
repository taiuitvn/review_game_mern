import express from "express";
import { uploadImage } from "../services/uploadImage.js";

const router_upload = express.Router();

router_upload.post("/image", async (req, res) => {
  try {
    const { image } = req.body;

    const result = await uploadImage(image);
    console.log(result);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router_upload;
