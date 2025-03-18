import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Retrieve top 10 scores
    const leaderboard = await redis.zrevrange("game_leaderboard", 0, 9, { withScores: true });

    return res.status(200).json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching leaderboard", details: error.message });
  }
}
