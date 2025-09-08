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

// Test login endpoint accessibility
test_router.post("/test-login", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Login endpoint is accessible",
    timestamp: new Date().toISOString()
  });
});

// Test to verify auth routes are working
test_router.get("/auth-routes", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Auth routes are accessible",
    routes: [
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/auth/me",
      "GET /api/auth/users"
    ]
  });
});

export default test_router;