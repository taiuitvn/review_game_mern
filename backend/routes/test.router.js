import express from "express";

const test_router = express.Router();

// Test route to verify API is working
test_router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API is running",
    timestamp: new Date().toISOString()
  });
});

// Test login endpoint
test_router.post("/test-login", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Login endpoint is accessible",
    timestamp: new Date().toISOString()
  });
});

export default test_router;