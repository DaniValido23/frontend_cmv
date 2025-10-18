import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/waiting-room", "/consultations", "/patients", "/users"];
const doctorOnlyRoutes = ["/users", "/patients"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect } = context;

  // Check if route needs protection
  const isProtected = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  if (!isProtected) {
    return next();
  }

  // Check authentication from cookie or session storage
  // Note: In SSR, we need to rely on cookies or server-side session
  // For client-side auth with sessionStorage, we'll use a different approach

  // For now, allow access and let client-side handle auth
  // The real protection will be at the API level
  return next();
});
