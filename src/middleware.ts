import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/waiting-room", "/consultations", "/patients", "/users", "/analytics"];
const doctorOnlyRoutes = ["/users", "/patients", "/analytics"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;

  const isProtected = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  if (!isProtected) {
    return next();
  }

  return next();
});
