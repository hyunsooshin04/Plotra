import type { Request, Response, NextFunction } from "express";
import { verifyEncryptedToken, type TokenPayload } from "../lib/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * 인증 미들웨어: Authorization 헤더에서 암호화된 토큰을 추출하고 검증한다.
 * 성공 시 req.user에 payload를 설정한다.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization token required" });
    return;
  }

  const encryptedToken = header.slice(7);
  try {
    req.user = verifyEncryptedToken(encryptedToken);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
