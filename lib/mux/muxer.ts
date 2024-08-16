import { Muxer as WebmMuxer, ArrayBufferTarget } from "webm-muxer";

class Muxer {
  webmMuxer: WebmMuxer<ArrayBufferTarget>;
  duration: number;
  finish: {
    promise: Promise<boolean>;
    resolve: (v: boolean) => void;
  };

  constructor(
    muxerConfig: { height: number; width: number },
    duration: number
  ) {
    this.duration = duration;
    let _resolve: (v: boolean) => void;
    const promise: Promise<boolean> = new Promise((resolve) => {
      _resolve = resolve;
    });

    this.finish = {
      promise: promise,
      resolve: _resolve!,
    };

    this.webmMuxer = new WebmMuxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: "V_VP8",
        width: muxerConfig.width,
        height: muxerConfig.height,
      },
    });
  }

  addVideoChunk(chunk: EncodedVideoChunk, meta?: EncodedVideoChunkMetadata) {
    this.webmMuxer.addVideoChunk(chunk, meta);
    console.log(chunk.timestamp, this.duration);
    // FIXME: bug.... but I need to learn how to judge finish
    if (chunk.timestamp > this.duration - 1e6) {
      this.finish.resolve(true);
    }
  }

  addAudioChunk(chunk: EncodedAudioChunk, meta: EncodedAudioChunkMetadata) {
    this.webmMuxer.addAudioChunk(chunk, meta);
  }

  async getWebm() {
    await this.finish.promise;
    this.webmMuxer.finalize();

    const { buffer } = this.webmMuxer.target;
    return buffer;
  }
}

export default Muxer;
