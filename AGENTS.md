<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Next.js 16 Rules
1. **Middleware is now Proxy**: Do NOT use `middleware.ts`. Use `proxy.ts` in the root.
2. **Proxy Export**: `proxy.ts` MUST use a `default export` for the function named `proxy`.
   - Example: `export default async function proxy(request: NextRequest) { ... }`
3. **Turbopack**: Prefer Turbopack for development.
<!-- END:nextjs-agent-rules -->
