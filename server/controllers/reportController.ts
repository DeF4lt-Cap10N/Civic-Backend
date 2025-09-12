import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/Report";
import { User } from "../models/User";
import { processUploadedFile } from "../utils/fileUpload";
import { sendNotification } from "../utils/notificationService";

export async function createReport(req: Request, res: Response) {
  const userId = req.user!.id;
  const { title, description, category } = req.body as {
    title: string;
    description: string;
    category: string;
  } as any;

  // Parse location from JSON or multipart fields
  const b: any = req.body || {};
  let loc: { lat: number; lng: number } | undefined = undefined;
  try {
    if (typeof b.location === "string") {
      const parsed = JSON.parse(b.location);
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        loc = { lat: parsed.lat, lng: parsed.lng };
      }
    } else if (b.location && typeof b.location === "object") {
      const lat = Number(b.location.lat);
      const lng = Number(b.location.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) loc = { lat, lng };
    }
  } catch {}
  if (!loc) {
    const latStr = b.lat ?? b["location[lat]"] ?? b["location.lat"];
    const lngStr = b.lng ?? b["location[lng]"] ?? b["location.lng"];
    const lat = latStr != null ? Number(latStr) : undefined;
    const lng = lngStr != null ? Number(lngStr) : undefined;
    if (typeof lat === "number" && !Number.isNaN(lat) && typeof lng === "number" && !Number.isNaN(lng)) {
      loc = { lat, lng };
    }
  }

  if (!title || !description || !category) return res.status(400).json({ error: "title, description, category are required" });

  const localPath = (req as any).file?.path as string | undefined;
  const photoUrl = await processUploadedFile(localPath);

  const geo = loc && typeof loc.lat === "number" && typeof loc.lng === "number"
    ? { type: "Point" as const, coordinates: [loc.lng, loc.lat] as [number, number] }
    : undefined;

  const history = [
    { status: "pending" as const, updatedBy: new mongoose.Types.ObjectId(userId), timestamp: new Date() },
  ];

  const report = await Report.create({
    title,
    description,
    category,
    status: "pending",
    photoUrl,
    location: loc,
    geo,
    citizenId: new mongoose.Types.ObjectId(userId),
    history,
  });

  res.status(201).json(report);
}

export async function getMyReports(req: Request, res: Response) {
  const userId = req.user!.id;
  const reports = await Report.find({ citizenId: userId }).sort({ createdAt: -1 });
  res.json(reports);
}

export async function getReportById(req: Request, res: Response) {
  const id = req.params.id;
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  const role = req.user?.role;
  if (role === "citizen" && report.citizenId.toString() !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(report);
}

export async function getAllReports(req: Request, res: Response) {
  const { category, status, dateFrom, dateTo, lat, lng, radiusKm } = req.query as any;
  const filter: any = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }
  if (lat && lng && radiusKm) {
    const radiusInMeters = parseFloat(radiusKm) * 1000;
    filter.geo = {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radiusInMeters,
      },
    };
  }
  const reports = await Report.find(filter).sort({ createdAt: -1 });
  res.json(reports);
}

export async function updateReportStatus(req: Request, res: Response) {
  const id = req.params.id;
  const { status } = req.body as { status: "pending" | "acknowledged" | "in-progress" | "resolved" };
  if (!status) return res.status(400).json({ error: "status is required" });

  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ error: "Report not found" });

  report.status = status;
  report.history.push({ status, updatedBy: new mongoose.Types.ObjectId(req.user!.id), timestamp: new Date() });
  if (status === "resolved") {
    report.resolvedAt = new Date();
  }

  await report.save();
  res.json(report);
}

export async function assignReport(req: Request, res: Response) {
  const id = req.params.id;
  const { departmentId, staffId } = req.body as { departmentId?: string; staffId?: string };
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ error: "Report not found" });

  if (departmentId) report.assignedDeptId = new mongoose.Types.ObjectId(departmentId);
  if (staffId) report.assignedStaffId = new mongoose.Types.ObjectId(staffId);

  await report.save();
  res.json(report);
}

export async function notifyCitizen(req: Request, res: Response) {
  const id = req.params.id;
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  const citizenId = report.citizenId.toString();
  const { message } = req.body as { message: string };
  const result = await sendNotification(citizenId, message || `Update on your report: ${report.title}`);
  res.json({ success: true, previewUrl: (result as any).previewUrl || null });
}
