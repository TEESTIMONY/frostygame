import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, score } = req.body;

  if (!username || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // Save score with username as key
    await redis.set(`score:${username}`, score);

    res.status(200).json({ message: "Score saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error saving score" });
  }
}
