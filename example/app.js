const start = document.querySelector('#start')
const stop = document.querySelector('#stop')
const play = document.querySelector('#play')
const download = document.querySelector('#download')

let blob
let recordingState

start.addEventListener('click', async () => {
  recordingState = await WaveRecorder.start()
})

stop.addEventListener('click', async () => {
  if (!recordingState) {
    return
  }
  blob = await WaveRecorder.stop(recordingState)
  recordingState = null
})

play.addEventListener('click', () => {
  if (!blob) {
    return
  }
  const url = window.URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play()
})

download.addEventListener('click', () => {
  if (!blob) {
    return
  }
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  document.body.appendChild(anchor)
  anchor.href = url
  anchor.download = `${Date.now()}.wav`
  anchor.click()
  window.URL.revokeObjectURL(url)
})
