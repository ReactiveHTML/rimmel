import dts from 'rollup-plugin-dts';

export default {
  input: './dist/esm/types/index.d.ts', // The main entry for types
  output: {
    file: './dist/esm/rimmel.d.ts',
    format: 'es'
  },
  plugins: [dts()]
};
