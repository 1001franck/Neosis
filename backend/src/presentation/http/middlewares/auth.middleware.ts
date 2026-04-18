import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../shared/config/env.js";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Cookie httpOnly (web) ou Authorization header (app desktop Tauri)
  const token = req.cookies?.token
    ?? req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ success: false, error: "Accès refusé. Token manquant." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // req.userId est reconnu grâce à ton fichier src/types/express.d.ts
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Token invalide ou expiré." });
  }
};