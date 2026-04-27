---
"@hirokisakabe/pom": patch
---

fix: hide dynamic `require` in `renderIcon.ts` from bundler static analysis using `Function` constructor. Resolves Next.js 16 / Turbopack build failure (`Module not found: Can't resolve <dynamic>`) when consuming `@hirokisakabe/pom` in Next.js apps. Runtime behavior is unchanged.
