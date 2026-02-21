import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import shortlistRoutes from "./routes/shortlist.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "https://vendor-discovery.vercel.app",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
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
