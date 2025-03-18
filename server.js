import { Redis } from "@upstash/redis";
import express from "express";
import cors from "cors";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const app = express();
app.use(express.json());
app.use(cors());

const LEADERBOARD_KEY = "game_leaderboard";

// Save user score
app.post("/submit-score", async (req, res) => {
  const { username, score } = req.body;
  if (!username || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  await redis.zadd(LEADERBOARD_KEY, { score, member: username });
  res.json({ success: true });
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  const leaderboard = await redis.zrevrange(LEADERBOARD_KEY, 0, 9, { withScores: true });
  res.json(leaderboard);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
