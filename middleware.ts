// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Autoriser les routes publiques
//   if (PUBLIC_ROUTES.some((path) => pathname.startsWith(path))) {
//     return NextResponse.next();
//   }

//   // Lire le token dans les cookies
//   const token = req.cookies.get("token")?.value;

//   // Rediriger si token manquant
//   if (!token) {
//     // Redirection absolue vers ton domaine + /sign-in
//     const signInUrl = new URL("http://vente.auf-sarlu.mg/sign-in");
//     return NextResponse.redirect(signInUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next|.*\\.(?:png|jpg|jpeg|svg|js|css|json|ico|webp|ttf|woff2?|map)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Ne pas vérifier le cookie ici (cross-domain HttpOnly)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:png|jpg|jpeg|svg|js|css|json|ico|webp|ttf|woff2?|map)).*)",
    "/(api|trpc)(.*)",
  ],
};
