import { Request, Response } from "express";
import { User } from "../models/User";

export async function promoteToAdmin(req: Request, res: Response) {
  const seed = req.header("X-Admin-Seed");
  if (!seed || seed !== process.env.ADMIN_SEED_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "email is required" });

  const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin" } }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, email: user.email, role: user.role });
}
