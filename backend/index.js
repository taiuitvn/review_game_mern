import app from "./server.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// For Vercel, we need to export the app as default
// Vercel will handle the server initialization
export default app;

// For local development, start the server
if (!process.env.VERCEL) {
  const port = process.env.PORT || 8000;
  
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📄 API Documentation available at http://localhost:${port}/api-docs`);
  });
}