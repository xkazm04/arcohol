import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'middleware/index': 'src/middleware/index.ts',
    'middleware/express': 'src/middleware/express.ts',
    'middleware/nextjs': 'src/middleware/nextjs.ts',
    'react/index': 'src/react/index.ts',
    'client/index': 'src/client/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  external: ['react', 'viem', 'express', 'next'],
});
