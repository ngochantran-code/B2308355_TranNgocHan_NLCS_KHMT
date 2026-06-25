import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./app/config/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});