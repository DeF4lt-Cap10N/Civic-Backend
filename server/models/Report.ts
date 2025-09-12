import mongoose, { Schema, Document, Model } from "mongoose";

export type ReportStatus = "pending" | "acknowledged" | "in-progress" | "resolved";

export interface IHistoryEntry {
  status: ReportStatus;
  updatedBy: mongoose.Types.ObjectId; // ref User
  timestamp: Date;
}

export interface IReport extends Document {
  title: string;
  description: string;
  category: string;
  status: ReportStatus;
  photoUrl?: string;
  location?: { lat: number; lng: number };
  geo?: { type: "Point"; coordinates: [number, number] };
  citizenId: mongoose.Types.ObjectId; // ref User
  assignedDeptId?: mongoose.Types.ObjectId | null; // ref Department
  assignedStaffId?: mongoose.Types.ObjectId | null; // ref User
  history: IHistoryEntry[];
  createdAt: Date;
  resolvedAt?: Date | null;
}

const HistorySchema = new Schema<IHistoryEntry>({
  status: { type: String, enum: ["pending", "acknowledged", "in-progress", "resolved"], required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

const ReportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "acknowledged", "in-progress", "resolved"],
      default: "pending",
      index: true,
    },
    photoUrl: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    geo: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
    citizenId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedDeptId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    assignedStaffId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    history: { type: [HistorySchema], default: [] },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReportSchema.index({ geo: "2dsphere" });

export const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
