import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: "Missing username or score" });
  }

  try {
    // Store the score in a sorted set (leaderboard)
    await redis.zadd("game_leaderboard", { score, member: username });

    return res.status(200).json({ message: "Score saved successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "Error saving score", details: error.message });
  }
}
