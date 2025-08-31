import Notification from "../models/Notification.js";

export const getNotifybyUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const notifications = await Notification.find({ userId: userId });
    if (!notifications) {
      return res.status(400).json({ error: error.message });
    }
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const newNoti = await Notification.create(req.body);
    req.status(201).json(newNoti);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
