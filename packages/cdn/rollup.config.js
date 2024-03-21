import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/ads.js',
    format: 'umd',
    name: 'tgadhub',
    sourcemap: true
  },
  plugins: [typescript(), nodeResolve(), commonjs()]
};
