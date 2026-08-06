import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Convenção desta versão do Next.js: `middleware.ts` foi renomeado pra
// `proxy.ts` (ver node_modules/next/dist/docs/.../proxy.md). O wrapper
// `auth()` do NextAuth continua funcionando aqui — ele só espera receber e
// devolver o mesmo contrato NextRequest/NextResponse, independente do nome
// do arquivo que o Next usa pra descobrir a rota.
export default auth((req) => {
  const isLoggedIn = Boolean(req.auth);
  const { pathname } = req.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname === "/login";

  const isServerAction = req.headers.has("next-action");

  if (isProtectedRoute && !isLoggedIn && !isServerAction) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
