import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/hooks/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    clean: true,
    treeshake: true,
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
]);
