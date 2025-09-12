import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

function signToken(id: string, role: "citizen" | "staff" | "admin") {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id, role }, secret, { expiresIn });
}

export async function signup(req: Request, res: Response) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email and password are required" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const user = await User.create({ name, email, password, phone, role: "citizen" });
  const token = signToken(user.id, user.role);
  const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
  res.status(201).json({ token, user: safe });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await user.comparePassword(password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id, user.role);
  const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
  res.json({ token, user: safe });
}
