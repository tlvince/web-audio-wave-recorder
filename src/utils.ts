export const flattenArray = (
  channelBuffer: Float32Array[],
  recordingLength: number
): Float32Array => {
  const result = new Float32Array(recordingLength)
  let offset = 0
  for (let i = 0; i < channelBuffer.length; i++) {
    let buffer = channelBuffer[i]
    result.set(buffer, offset)
    offset += buffer.length
  }
  return result
}

export const writeUTFBytes = (
  view: DataView,
  offset: number,
  descriptor: string
): void => {
  for (let i = 0; i < descriptor.length; i++) {
    view.setUint8(offset + i, descriptor.charCodeAt(i))
  }
}

// [left[0],right[0],left[1],right[1],...]
export const interleave = (
  leftChannel: Float32Array,
  rightChannel: Float32Array
): Float32Array => {
  const length = leftChannel.length + rightChannel.length
  const result = new Float32Array(length)
  let inputIndex = 0
  for (let index = 0; index < length; ) {
    result[index++] = leftChannel[inputIndex]
    result[index++] = rightChannel[inputIndex]
    inputIndex++
  }
  return result
}

interface WavParams {
  volume: number
  samples: Float32Array
  channels: number
  sampleRate: number
}

export const encodeWav = ({
  volume,
  samples,
  channels,
  sampleRate,
}: WavParams): DataView => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  let view = new DataView(buffer)

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF')
  view.setUint32(4, 44 + samples.length * 2, true)
  writeUTFBytes(view, 8, 'WAVE')

  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunkSize
  view.setUint16(20, 1, true) // wFormatTag
  view.setUint16(22, channels, true) // wChannels
  view.setUint32(24, sampleRate, true) // dwSamplesPerSec
  view.setUint32(28, sampleRate * (channels * 2), true) // dwAvgBytesPerSec
  view.setUint16(32, 4, true) // wBlockAlign
  view.setUint16(34, 16, true) // wBitsPerSample

  // data sub-chunk
  writeUTFBytes(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // write the PCM samples
  let index = 44
  for (var i = 0; i < samples.length; i++) {
    view.setInt16(index, samples[i] * (0x7fff * volume), true)
    index += 2
  }

  return view
}
