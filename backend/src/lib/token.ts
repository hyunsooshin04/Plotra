import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "plotra-dev-secret";
const ENCRYPT_KEY = process.env.TOKEN_ENCRYPT_KEY ?? "plotra-encrypt-key-32chars!!!!!"; // must be 32 bytes for aes-256
const ALGORITHM = "aes-256-cbc";

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * JWT를 생성한 뒤, 전체 토큰 문자열을 AES-256-CBC로 암호화하여 반환한다.
 * 클라이언트에게는 암호화된 토큰만 전달되므로 디코딩으로 내용을 볼 수 없다.
 */
export function createEncryptedToken(payload: TokenPayload, expiresIn: string | number = "7d"): string {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
  return encrypt(token);
}

/**
 * 암호화된 토큰을 복호화한 뒤 JWT를 검증하여 payload를 반환한다.
 */
export function verifyEncryptedToken(encryptedToken: string): TokenPayload {
  const token = decrypt(encryptedToken);
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

function encrypt(text: string): string {
  const key = normalizeKey(ENCRYPT_KEY);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  // iv:encrypted 형태로 반환 (hex)
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(data: string): string {
  const key = normalizeKey(ENCRYPT_KEY);
  const [ivHex, encryptedHex] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

function normalizeKey(key: string): Buffer {
  // 항상 32 bytes로 맞추기 (SHA-256 해시)
  return crypto.createHash("sha256").update(key).digest();
}
