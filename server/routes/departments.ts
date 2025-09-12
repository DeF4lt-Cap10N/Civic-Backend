import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController";

const router = Router();

router.get("/", authenticate, authorizeRoles("staff", "admin"), listDepartments);
router.post("/", authenticate, authorizeRoles("admin"), createDepartment);
router.put("/:id", authenticate, authorizeRoles("admin"), updateDepartment);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteDepartment);

export default router;
