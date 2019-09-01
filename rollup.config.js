import typescript from 'rollup-plugin-typescript'

export default {
  input: './src/index.ts',
  output: {
    file: './dist/web-audio-wave-recorder.js',
  },
  plugins: [typescript()],
}
