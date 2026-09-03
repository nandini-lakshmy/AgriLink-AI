import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "farmer" | "buyer";
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication token required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Authentication token required",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      message: "JWT_SECRET is not configured",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "string" ||
      (decoded.role !== "farmer" && decoded.role !== "buyer")
    ) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}