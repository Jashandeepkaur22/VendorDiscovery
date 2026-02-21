import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import shortlistRoutes from "./routes/shortlist.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/shortlist", shortlistRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
