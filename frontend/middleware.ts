export { default } from "./src/proxy";

// IMPORTANT: Next.js middleware config must be declared here (not re-exported)
export const config = {
	matcher: ["/((?!.*\\..*|_next).*)"],
};
