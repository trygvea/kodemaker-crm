import '@testing-library/jest-dom'

// Next.js API route modules import 'next/server' which expects global Request/Response
// Provide minimal polyfills for test environment
if (!(global as any).Request) {
  ;(global as any).Request = class {}
}
if (!(global as any).Response) {
  ;(global as any).Response = class {}
}
if (!(global as any).ReadableStream) {
  ;(global as any).ReadableStream = class {}
}
