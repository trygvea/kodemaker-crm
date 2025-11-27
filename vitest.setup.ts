import "@testing-library/jest-dom/vitest";

// Next.js API route modules import 'next/server' which expects global Request/Response
// Provide minimal polyfills for test environment
/* eslint-disable @typescript-eslint/no-explicit-any */
if (!(global as any).Request) {
  (global as any).Request = class {};
}
if (!(global as any).Response) {
  (global as any).Response = class {};
}
if (!(global as any).ReadableStream) {
  (global as any).ReadableStream = class {};
}
/* eslint-enable @typescript-eslint/no-explicit-any */
