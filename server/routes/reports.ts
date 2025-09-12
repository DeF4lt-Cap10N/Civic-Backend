import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";
import { upload } from "../utils/fileUpload";
import {
  createReport,
  getMyReports,
  getReportById,
  getAllReports,
  updateReportStatus,
  assignReport,
  notifyCitizen,
} from "../controllers/reportController";

const router = Router();

// Citizen
router.post("/", authenticate, authorizeRoles("citizen"), upload.single("photo"), createReport);
router.get("/my", authenticate, authorizeRoles("citizen"), getMyReports);

// Access specific report: citizens (own), staff/admin (any)
router.get("/:id", authenticate, getReportById);

// Admin/Staff
router.get("/", authenticate, authorizeRoles("staff", "admin"), getAllReports);
router.put("/:id/status", authenticate, authorizeRoles("staff", "admin"), updateReportStatus);
router.put("/:id/assign", authenticate, authorizeRoles("staff", "admin"), assignReport);
router.post("/:id/notify", authenticate, authorizeRoles("staff", "admin"), notifyCitizen);

export default router;
