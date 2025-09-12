import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";
import { summary, trends, heatmap } from "../controllers/analyticsController";

const router = Router();

router.get("/summary", authenticate, authorizeRoles("staff", "admin"), summary);
router.get("/trends", authenticate, authorizeRoles("staff", "admin"), trends);
router.get("/heatmap", authenticate, authorizeRoles("staff", "admin"), heatmap);

export default router;
