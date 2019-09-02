# web-audio-wave-recorder

> Record wav files using Web Audio APIs

Unfortunately, [MediaRecorder][] does not support [wav][] files (technically linear PCM encoding). This uses the older and less fluent [AudioContext][] API, manually dealing with audio buffers and `.wav` header construction.

[wav]: https://en.wikipedia.org/wiki/WAV
[audiocontext]: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
[mediarecorder]: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

## API

### `start(options: RecordingOptions): Promise<RecordingState>`

Takes optional [recording options][] and starts recording.

[recording options]: https://github.com/tlvince/web-audio-wave-recorder/blob/b1fb40ca7cfe4242351806b1a2938e66532cc840/src/index.ts#L15-L20

### `stop(recordingState: RecordingState): Promise<Blob>`

Takes required [recording state][] and returns a blob of type `audio/wav`.

[recording state]: https://github.com/tlvince/web-audio-wave-recorder/blob/b1fb40ca7cfe4242351806b1a2938e66532cc840/src/index.ts#L3-L13

## Prior art

- Based heavily on [meziantou: Javascript - Record audio][1]
- References [Capturing Voice Input in a Browser and Sending it to Amazon Lex][2]

[1]: https://gist.github.com/meziantou/edb7217fddfbb70e899e
[2]: https://aws.amazon.com/blogs/machine-learning/capturing-voice-input-in-a-browser/

## Author

© 2019 Tom Vincent <git@tlvince.com> (https://tlvince.com)

## License

Released under the [MIT license](https://tlvince.mit-license.org).
