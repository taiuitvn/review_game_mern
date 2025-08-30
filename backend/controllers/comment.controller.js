import Comment from "../models/Comment.js";

export const getCommentByPostId = async (req, res) => {
  try {
    const postId = req.params.id;
    const comment = await Comment.find({ postId });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(400).json({ err: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const newComment = await Comment.create(req.body);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeCommentById = async (req, res) => {
  try {
    const commentId = req.params.id;
    const newComment = await Comment.deleteOne({ _id: commentId });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const editCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // return the updated document
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const userId = req.user.id;
    const index = comment.likes.indexOf(userId);

    if (index === -1) comment.likes.push(userId); // Like
    else comment.likes.splice(index, 1); // Unlike
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
