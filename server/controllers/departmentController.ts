import { Request, Response } from "express";
import mongoose from "mongoose";
import { Department } from "../models/Department";
import { User } from "../models/User";

export async function listDepartments(_req: Request, res: Response) {
  const depts = await Department.find({}).sort({ name: 1 }).populate("staff", "name email role");
  res.json(depts);
}

export async function createDepartment(req: Request, res: Response) {
  const { name, description, staff } = req.body as { name: string; description?: string; staff?: string[] };
  if (!name) return res.status(400).json({ error: "name is required" });
  const dept = await Department.create({ name, description, staff: staff?.map((s) => new mongoose.Types.ObjectId(s)) || [] });

  if (staff && staff.length) {
    await User.updateMany({ _id: { $in: staff } }, { $set: { role: "staff", departmentId: dept._id } });
  }

  res.status(201).json(dept);
}

export async function updateDepartment(req: Request, res: Response) {
  const id = req.params.id;
  const { name, description, staff } = req.body as { name?: string; description?: string; staff?: string[] };
  const dept = await Department.findById(id);
  if (!dept) return res.status(404).json({ error: "Department not found" });

  if (typeof name === "string") dept.name = name;
  if (typeof description === "string") dept.description = description;
  if (Array.isArray(staff)) {
    dept.staff = staff.map((s) => new mongoose.Types.ObjectId(s));
    await User.updateMany({ _id: { $in: staff } }, { $set: { role: "staff", departmentId: dept._id } });
  }

  await dept.save();
  res.json(dept);
}

export async function deleteDepartment(req: Request, res: Response) {
  const id = req.params.id;
  const dept = await Department.findByIdAndDelete(id);
  if (!dept) return res.status(404).json({ error: "Department not found" });
  await User.updateMany({ departmentId: id }, { $set: { departmentId: null } });
  res.json({ success: true });
}
