import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import license from 'rollup-plugin-license';
import packageJson from './package.json' assert {type: 'json'};

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
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    license({
      banner: {
        commentStyle: 'ignored',
        content: 'version: ' + packageJson.version
      }
    })
  ]
};
