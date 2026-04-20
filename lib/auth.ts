import { hash, compare } from "bcrypt";
import { SignJWT, jwtVerify } from "jose"
import { createHash, randomUUID } from "crypto";


type AuthPayload = {
  userId: string;
  email: string
}

const accessSecret = process.env.ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET ?? process.env.JWT_SECRET

if (!accessSecret) throw new Error("ACCESS_TOKEN_SECRET is not set");
if (!refreshSecret) throw new Error("REFRESH_TOKEN_SECRET is not set");


const accessSecretKey = new TextEncoder().encode(accessSecret);
const refreshSecretKey = new TextEncoder().encode(refreshSecret);

function hashPassword(password: string) {
  return hash(password, 12);
}

function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

async function createAccessToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecretKey);
}


async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecretKey);
  return payload
}

async function createRefreshToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(randomUUID())
    .setExpirationTime("30d")
    .sign(refreshSecretKey);
}

async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecretKey);
  return payload;
}

export {
  hashPassword,
  verifyPassword,
  hashRefreshToken,
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
}