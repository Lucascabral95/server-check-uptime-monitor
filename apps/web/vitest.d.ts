/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  export interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  export interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}
