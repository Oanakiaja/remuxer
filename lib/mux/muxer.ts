import { Muxer as WebmMuxer, ArrayBufferTarget } from "webm-muxer";

class Muxer {
  webmMuxer: WebmMuxer<ArrayBufferTarget>;

  constructor(muxerConfig: { height: number; width: number }) {
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
  }

  addAudioChunk(chunk: EncodedAudioChunk, meta: EncodedAudioChunkMetadata) {
    this.webmMuxer.addAudioChunk(chunk, meta);
  }

  getWebm() {
    this.webmMuxer.finalize();

    const { buffer } = this.webmMuxer.target;
    return buffer;
  }
}

export default Muxer;
