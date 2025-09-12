import { Request, Response } from "express";
import { Report } from "../models/Report";

export async function summary(_req: Request, res: Response) {
  const [pending, acknowledged, inProgress, resolved, total] = await Promise.all([
    Report.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: "acknowledged" }),
    Report.countDocuments({ status: "in-progress" }),
    Report.countDocuments({ status: "resolved" }),
    Report.estimatedDocumentCount(),
  ]);

  const resolvedReports = await Report.find({ status: "resolved", resolvedAt: { $ne: null } }, { createdAt: 1, resolvedAt: 1 });
  const avgMs = resolvedReports.length
    ? resolvedReports.reduce((acc, r) => acc + (r.resolvedAt!.getTime() - r.createdAt.getTime()), 0) / resolvedReports.length
    : 0;

  res.json({
    total,
    open: pending + acknowledged + inProgress,
    resolved,
    averageResolutionMs: Math.round(avgMs),
  });
}

export async function trends(req: Request, res: Response) {
  const granularity = (req.query.granularity as string) || "daily";
  let dateFormat = "%Y-%m-%d";
  if (granularity === "weekly") dateFormat = "%G-%V"; // ISO week
  if (granularity === "monthly") dateFormat = "%Y-%m";

  const data = await Report.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(
    data.map((d) => ({ period: d._id, count: d.count }))
  );
}

export async function heatmap(_req: Request, res: Response) {
  const data = await Report.aggregate([
    { $match: { "location.lat": { $ne: null }, "location.lng": { $ne: null } } },
    {
      $project: {
        lat: { $round: ["$location.lat", 2] },
        lng: { $round: ["$location.lng", 2] },
      },
    },
    { $group: { _id: { lat: "$lat", lng: "$lng" }, count: { $sum: 1 } } },
    { $project: { _id: 0, lat: "$_id.lat", lng: "$_id.lng", count: 1 } },
    { $sort: { count: -1 } },
  ]);

  res.json(data);
}
