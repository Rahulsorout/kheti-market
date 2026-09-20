const Notification = require("../models/notification");

// Create a new notification
const createNotification = async (userId, message, link = null) => {
  try {
    await Notification.create({
      user: userId,
      message,
      link
    });
  } catch (error) {
    console.error("NOTIFICATION ERROR:", error.message);
  }
};


// Get notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Cannot fetch notifications" });
  }
};


// Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: "Not found" });

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Marked as read" });

  } catch (error) {
    res.status(500).json({ message: "Cannot update notification" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};
