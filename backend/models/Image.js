import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
});

export default mongoose.model("Image", imageSchema);
