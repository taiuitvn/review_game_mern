import app from "./server.js";
import dotenv from "dotenv";
async function main() {
  dotenv.config();
  // const client = new mongodb.MongoClient(process.env.MOVIE_REVIEWS_APP_URI);
  const port = process.env.PORT || 5000;

  // await client.connect();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
main().catch(console.error);
