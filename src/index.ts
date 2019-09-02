import { flattenArray, interleave, encodeWav } from './utils'

export interface RecordingState {
  state: {
    channelData: Float32Array[][]
    recordingLength: number
  }
  volume: number
  context: AudioContext
  recorder: ScriptProcessorNode
  sampleRate: number
  mediaStream: MediaStreamAudioSourceNode
}

export interface RecordingOptions {
  volume?: number
  channels?: number
  bufferSize?: number
  sampleRate?: number
}

const defaultOptions = {
  volume: 1,
  channels: 1,
  bufferSize: 2048,
  sampleRate: 44100,
}

export const start = async (
  options: RecordingOptions = {}
): Promise<RecordingState> => {
  const { volume, channels, bufferSize, sampleRate } = {
    ...defaultOptions,
    ...options,
  }

  const state = {
    channelData: [],
    recordingLength: 0,
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const context = new AudioContext()
  const mediaStream = context.createMediaStreamSource(stream)
  const recorder = context.createScriptProcessor(bufferSize, channels, channels)

  recorder.onaudioprocess = (audioEvent: AudioProcessingEvent): void => {
    for (let i = 0; i < channels; i++) {
      const channelDatum = new Float32Array(
        audioEvent.inputBuffer.getChannelData(i)
      )
      state.channelData[i]
        ? state.channelData[i].push(channelDatum)
        : (state.channelData[i] = [channelDatum])
    }
    state.recordingLength += bufferSize
  }

  mediaStream.connect(recorder)
  recorder.connect(context.destination)

  return {
    state,
    volume,
    context,
    recorder,
    sampleRate,
    mediaStream,
  }
}

export const stop = async (recordingState: RecordingState): Promise<Blob> => {
  const {
    state: { channelData, recordingLength },
    volume,
    context,
    recorder,
    sampleRate,
    mediaStream,
  } = recordingState

  recorder.disconnect(context.destination)
  mediaStream.disconnect(recorder)
  await context.close()

  const leftBuffer = flattenArray(channelData[0], recordingLength)
  const samples =
    channelData.length === 2
      ? interleave(leftBuffer, flattenArray(channelData[1], recordingLength))
      : leftBuffer

  const dataView = encodeWav({
    volume,
    samples,
    channels: channelData.length,
    sampleRate,
  })

  return new Blob([dataView], { type: 'audio/wav' })
}
