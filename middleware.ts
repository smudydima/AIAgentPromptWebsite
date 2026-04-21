import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const accessSecret = process.env.ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET;

if (!accessSecret) {
    throw new Error("ACCESS_TOKEN_SECRET is not set");
}

const accessSecretKey = new TextEncoder().encode(accessSecret);

async function verifyAccessToken(token: string) {
    const { payload } = await jwtVerify(token, accessSecretKey);
    return payload;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("access_token")?.value;

    const protectedRoutes = ["/write-prompt"];

    if (protectedRoutes.includes(pathname)) {
        let isAuthenticated = false;

        if (accessToken) {
            try {
                await verifyAccessToken(accessToken);
                isAuthenticated = true;
            } catch {
                isAuthenticated = false;
            }
        }

        if (!isAuthenticated) {
            const url = request.nextUrl.clone();
            url.pathname = "/";
            url.searchParams.set("login", "true");
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/write-prompt"],
};
