import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'treasury/index': 'src/treasury/index.ts',
    'router/index': 'src/router/index.ts',
    'bridges/index': 'src/bridges/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  external: ['viem'],
});
