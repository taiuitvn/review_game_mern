import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "SECRET"); // Giống key bạn dùng trong jwt.sign()

    req.user = decoded; // Bây giờ req.user.id = user._id
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
