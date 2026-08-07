import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['server/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./server/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      exclude: ['**/*.test.ts', 'server/test-setup.ts', '**/dist/**', '**/node_modules/**'],
      // Measured from this repo's own coverage over the whole tree, with a
      // 2-point margin for run-to-run noise. Raise it when the suite improves;
      // never lower it. Lowering these lines is the only way coverage can
      // regress, which is the point.
      //
      // These numbers are deliberately NOT comparable to the old
      // bunfig.toml threshold of 0.66: Bun's runner cannot load
      // better-sqlite3 (a V8 native addon), so three of the six test files
      // crashed on import and that 66% was measured over only the four
      // modules that survived. This figure covers every source file.
      thresholds: {
        lines: 34,
        statements: 34,
        functions: 39,
        branches: 65,
      },
    },
  },
});
