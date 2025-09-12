import { Router } from "express";
import { promoteToAdmin } from "../controllers/adminController";

const router = Router();

router.post("/promote", promoteToAdmin);

export default router;
