var WaveRecorder = (function (exports) {
  'use strict';

  const flattenArray = (channelBuffer, recordingLength) => {
      const result = new Float32Array(recordingLength);
      let offset = 0;
      for (let i = 0; i < channelBuffer.length; i++) {
          const buffer = channelBuffer[i];
          result.set(buffer, offset);
          offset += buffer.length;
      }
      return result;
  };
  const writeUTFBytes = (view, offset, descriptor) => {
      for (let i = 0; i < descriptor.length; i++) {
          view.setUint8(offset + i, descriptor.charCodeAt(i));
      }
  };
  const interleave = (leftChannel, rightChannel) => {
      const length = leftChannel.length + rightChannel.length;
      const result = new Float32Array(length);
      let inputIndex = 0;
      for (let index = 0; index < length;) {
          result[index++] = leftChannel[inputIndex];
          result[index++] = rightChannel[inputIndex];
          inputIndex++;
      }
      return result;
  };
  const encodeWav = ({ volume, samples, channels, sampleRate, }) => {
      const buffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(buffer);
      writeUTFBytes(view, 0, 'RIFF');
      view.setUint32(4, 44 + samples.length * 2, true);
      writeUTFBytes(view, 8, 'WAVE');
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, channels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * (channels * 2), true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, samples.length * 2, true);
      let index = 44;
      for (let i = 0; i < samples.length; i++) {
          view.setInt16(index, samples[i] * (0x7fff * volume), true);
          index += 2;
      }
      return view;
  };

  const defaultOptions = {
      volume: 1,
      channels: 1,
      bufferSize: 2048,
      sampleRate: 44100,
  };
  const start = async (options = {}) => {
      const { volume, channels, bufferSize, sampleRate } = {
          ...defaultOptions,
          ...options,
      };
      const state = {
          channelData: [],
          recordingLength: 0,
      };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const mediaStream = context.createMediaStreamSource(stream);
      const recorder = context.createScriptProcessor(bufferSize, channels, channels);
      recorder.onaudioprocess = (audioEvent) => {
          for (let i = 0; i < channels; i++) {
              const channelDatum = new Float32Array(audioEvent.inputBuffer.getChannelData(i));
              state.channelData[i]
                  ? state.channelData[i].push(channelDatum)
                  : (state.channelData[i] = [channelDatum]);
          }
          state.recordingLength += bufferSize;
      };
      mediaStream.connect(recorder);
      recorder.connect(context.destination);
      return {
          state,
          volume,
          context,
          recorder,
          sampleRate,
          mediaStream,
      };
  };
  const stop = async (recordingState) => {
      const { state: { channelData, recordingLength }, volume, context, recorder, sampleRate, mediaStream, } = recordingState;
      recorder.disconnect(context.destination);
      mediaStream.disconnect(recorder);
      await context.close();
      const leftBuffer = flattenArray(channelData[0], recordingLength);
      const samples = channelData.length === 2
          ? interleave(leftBuffer, flattenArray(channelData[1], recordingLength))
          : leftBuffer;
      const dataView = encodeWav({
          volume,
          samples,
          channels: channelData.length,
          sampleRate,
      });
      return new Blob([dataView], { type: 'audio/wav' });
  };

  exports.start = start;
  exports.stop = stop;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
