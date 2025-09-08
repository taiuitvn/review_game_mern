import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "SECRET");

    req.user = decoded; // req.user.id = user._id
    req.userId = decoded.id; // Add userId for consistency
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, but continue without user
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "SECRET");

    req.user = decoded; // req.user.id = user._id
    req.userId = decoded.id; // Add userId for consistency
    next();
  } catch (err) {
    // Invalid token, but continue without user
    req.user = null;
    req.userId = null;
    next();
  }
};
