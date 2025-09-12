import { Request, Response, NextFunction } from "express";

export function authorizeRoles(...allowed: Array<"citizen" | "staff" | "admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    if (!allowed.includes(role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
