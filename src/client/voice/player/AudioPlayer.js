const EventEmitter = require('events').EventEmitter;
const Prism = require('prism-media');
const StreamDispatcher = require('../dispatcher/StreamDispatcher');
const Collection = require('../../../util/Collection');
const OpusEncoders = require('../opus/OpusEngineList');

const ffmpegArguments = [
  '-analyzeduration', '0',
  '-loglevel', '0',
  '-f', 's16le',
  '-ar', '48000',
  '-ac', '2',
];

class AudioPlayer extends EventEmitter {
  constructor(voiceConnection) {
    super();
    this.voiceConnection = voiceConnection;
    this.prism = new Prism();
    this.opusEncoder = OpusEncoders.fetch();
    this.streams = new Collection();
    this.streamingData = {
      channels: 2,
      count: 0,
      sequence: 0,
      timestamp: 0,
      pausedTime: 0,
    };
  }

  get currentTranscoder() {
    return this.streams.last().transcoder;
  }

  destroyStream(stream) {
    const data = this.streams.get(stream);
    if (!data) return;
    const transcoder = data.transcoder;
    const dispatcher = data.dispatcher;
    if (transcoder) transcoder.kill();
    if (dispatcher) dispatcher.destroy('end');
    this.streams.delete(stream);
  }

  destroyAllStreams(except) {
    for (const stream of this.streams.keys()) {
      if (except === stream) continue;
      if (except === true && this.streams.get(stream) === this.streams.last()) continue;
      this.destroyStream(stream);
    }
  }

  playUnknownStream(stream, { seek = 0, volume = 1, passes = 1 } = {}) {
    const options = { seek, volume, passes };
    const transcoder = this.prism.transcode({
      type: 'ffmpeg',
      media: stream,
      ffmpegArguments: ffmpegArguments.concat(['-ss', String(seek)]),
    });
    this.streams.set(transcoder.output, { transcoder, input: stream });
    transcoder.on('error', e => {
      this.destroyStream(stream);
      if (this.listenerCount('error') > 0) this.emit('error', e);
      this.emit('warn', `prism transcoder error - ${e}`);
    });
    return this.playPCMStream(transcoder.output, options);
  }

  playPCMStream(stream, { seek = 0, volume = 1, passes = 1 } = {}) {
    const options = { seek, volume, passes };
    this.destroyAllStreams(stream);
    const dispatcher = new StreamDispatcher(this, stream, options);
    dispatcher.on('speaking', value => this.voiceConnection.setSpeaking(value));
    if (!this.streams.has(stream)) this.streams.set(stream, { dispatcher, input: stream });
    this.streams.get(stream).dispatcher = dispatcher;
    dispatcher.on('end', () => this.destroyStream(stream));
    dispatcher.on('error', () => this.destroyStream(stream));
    return dispatcher;
  }
}

module.exports = AudioPlayer;
