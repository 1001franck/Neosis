import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./src/presentation/http/middlewares/auth.middleware.js";
import { createCheckRole } from "./src/presentation/http/middlewares/role.middleware.js";
import { PrismaClient } from "@prisma/client";
import { PrismaMemberRepository } from "./src/infrastructure/database/repositories/PrismaMemberRepository.js";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const prisma = new PrismaClient();
const memberRepository = new PrismaMemberRepository(prisma);
const checkRole = createCheckRole(memberRepository);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 1. LOGIN
app.post("/auth/login", (req: Request, res: Response) => {
  const { userId } = req.body;
  const id = userId || "user_test_123";
  
  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "24h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ success: true, message: `Utilisateur ${id} connecté via Cookie` });
});

// 2. LOGOUT
app.post("/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Déconnecté" });
});

// 3. ME
app.get("/auth/me", authMiddleware, (req: Request, res: Response) => {
  res.json({ success: true, userId: req.userId });
});

// 4. TEST RÔLE (Seul le OWNER de server_1 peut supprimer)
app.delete("/servers/:serverId", authMiddleware, checkRole(["OWNER"]), (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: `Action réussie : Le serveur ${req.params.serverId} a été supprimé par ${req.userId}` 
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 SERVEUR DE TEST RÔLES ACTIF SUR http://localhost:${PORT}`);
  console.log(`----------------------------------------------------------`);
  console.log(` TEST SUCCÈS (Hugo est OWNER) :`);
  console.log(`   1. curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"userId": "hugo_id"}' -c cookies.txt`);
  console.log(`   2. curl -X DELETE http://localhost:3001/servers/server_1 -b cookies.txt`);
  console.log(`\n❌ TEST ÉCHEC (Harel est MEMBER) :`);
  console.log(`   1. curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"userId": "Harel_id"}' -c cookies.txt`);
  console.log(`   2. curl -X DELETE http://localhost:3001/servers/server_1 -b cookies.txt`);
});