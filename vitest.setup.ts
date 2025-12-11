import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers, resetHandlersState } from "./cosmos/mocks/handlers";

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

// Mock ResizeObserver for cmdk/Radix UI components
if (typeof window !== "undefined" && !(window as any).ResizeObserver) {
  (window as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!(global as any).ResizeObserver) {
  (global as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock scrollIntoView for cmdk
Element.prototype.scrollIntoView = function () {};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const mswServer = setupServer(...handlers);

beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  resetHandlersState();
  mswServer.resetHandlers(...handlers);
});

afterAll(() => mswServer.close());
