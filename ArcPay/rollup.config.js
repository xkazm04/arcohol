import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@walletconnect/ethereum-provider',
];

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
    },
    external,
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/esm',
        outDir: './dist/esm',
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', '**/testing/**'],
      }),
      postcss({
        extract: 'styles/base.css',
        minimize: true,
      }),
      terser(),
    ],
  },
  // CJS build
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      exports: 'named',
    },
    external,
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        outDir: './dist/cjs',
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', '**/testing/**'],
        compilerOptions: {
          declaration: false,
          declarationDir: undefined,
          declarationMap: false,
        },
      }),
      postcss({
        inject: false,
        extract: false,
      }),
      terser(),
    ],
  },
  // Testing module - ESM
  {
    input: 'src/testing/index.ts',
    output: {
      dir: 'dist/testing/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
    },
    external: [...external, '@jest/globals'],
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/testing/esm',
        outDir: './dist/testing/esm',
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
      }),
    ],
  },
  // Testing module - CJS
  {
    input: 'src/testing/index.ts',
    output: {
      dir: 'dist/testing/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      exports: 'named',
    },
    external: [...external, '@jest/globals'],
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: './dist/testing/cjs',
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
        compilerOptions: {
          declaration: false,
          declarationDir: undefined,
          declarationMap: false,
        },
      }),
    ],
  },
];
