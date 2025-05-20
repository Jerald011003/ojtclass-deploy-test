import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/role-selection",
    "/api/(.*)",
    "/_next(.*)",
    "/favicon.ico",
    "/__nextjs_original-stack-frame(.*)"
  ],
  afterAuth(auth, req) {
    const response = NextResponse.next();
    
    response.headers.set("x-url", req.url);
    
    for (const cookie of req.cookies.getAll()) {
      response.cookies.set(cookie.name, cookie.value);
    }
    
    if (auth.isPublicRoute || auth.userId) {
      return response;
    }
    
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};