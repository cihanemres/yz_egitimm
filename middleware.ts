import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
  const isTeacherRoute = req.nextUrl.pathname.startsWith('/teacher');
  const isStudentRoute = req.nextUrl.pathname.startsWith('/student');

  if (isAuthPage) {
    if (isLoggedIn) {
      if (req.auth?.user?.role === "TEACHER") return NextResponse.redirect(new URL('/teacher', req.nextUrl));
      if (req.auth?.user?.role === "STUDENT") return NextResponse.redirect(new URL('/student', req.nextUrl));
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && (isTeacherRoute || isStudentRoute)) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isLoggedIn) {
    if (isTeacherRoute && req.auth?.user?.role !== "TEACHER") {
      return NextResponse.redirect(new URL('/student', req.nextUrl));
    }
    if (isStudentRoute && req.auth?.user?.role !== "STUDENT") {
      return NextResponse.redirect(new URL('/teacher', req.nextUrl));
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
