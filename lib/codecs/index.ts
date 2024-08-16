class Codecs {
  vDecoder: VideoDecoder;
  vEncoder: VideoEncoder;
  aDecoder?: AudioDecoder;
  aEncoder?: AudioEncoder;

  constructor({
    decodeConfig,
    encodeConfig,
  }: {
    decodeConfig: {
      v: VideoDecoderConfig;
      a?: AudioDecoderConfig;
    };
    encodeConfig: {
      v: VideoEncoderConfig;
      a?: AudioDecoderConfig;
      handler: {
        handleEncodedVideoChunk: (
          chunk: EncodedVideoChunk,
          metadata?: EncodedVideoChunkMetadata
        ) => void;
        handleEncodedAudioChunk?: (
          chunk: EncodedAudioChunk,
          metadata: EncodedAudioChunkMetadata
        ) => void;
      };
    };
  }) {
    const [vDecoder, aDecoder] = this._createDecoder(decodeConfig);
    const [vEncoder, aEncoder] = this._createEncoder(encodeConfig, {
      handleEncodedAudioChunk: encodeConfig.handler.handleEncodedAudioChunk,
      handleEncodedVideoChunk: encodeConfig.handler.handleEncodedVideoChunk,
    });
    this.vDecoder = vDecoder;
    this.aDecoder = aDecoder;
    this.vEncoder = vEncoder;
    this.aEncoder = aEncoder;
  }

  private _createDecoder(decodeConfig: {
    v: VideoDecoderConfig;
    a?: AudioDecoderConfig;
  }) {
    const vDecoder = new VideoDecoder({
      output: this._handleDecodedVideoFrame.bind(this),
      error: (e) => console.error(e),
    });
    vDecoder.configure(decodeConfig.v);

    if (!decodeConfig.a) return [vDecoder] as const;
    const aDecoder = new AudioDecoder({
      output: this._handleDecodedAudioData.bind(this),
      error: (e) => console.error(e),
    });
    aDecoder.configure(decodeConfig.a);

    return [vDecoder, aDecoder] as const;
  }

  private _createEncoder(
    encodeConfig: {
      v: VideoEncoderConfig;
      a?: AudioDecoderConfig;
    },
    handler: {
      handleEncodedVideoChunk: (
        chunk: EncodedVideoChunk,
        metadata?: EncodedVideoChunkMetadata
      ) => void;
      handleEncodedAudioChunk?: (
        chunk: EncodedAudioChunk,
        metadata: EncodedAudioChunkMetadata
      ) => void;
    }
  ) {
    const vEncoder = new VideoEncoder({
      output: handler.handleEncodedVideoChunk,
      error: (e) => console.error(e),
    });

    vEncoder.configure(encodeConfig.v);

    if (!encodeConfig.a || !handler.handleEncodedAudioChunk)
      return [vEncoder] as const;

    const aEncoder = new AudioEncoder({
      output: handler.handleEncodedAudioChunk,
      error: (e) => console.error(e),
    });

    aEncoder.configure(encodeConfig.a);

    return [vEncoder, aEncoder] as const;
  }

  private _handleDecodedVideoFrame(frame: VideoFrame) {
    this.vEncoder.encode(frame);
    frame.close();
  }

  private _handleDecodedAudioData(data: AudioData) {
    if (!this.aEncoder) return;
    this.aEncoder.encode(data);
    data.close();
  }

  decode(chunk: EncodedVideoChunk) {
    this.vDecoder.decode(chunk);
  }

  async flush() {
    await this.vEncoder.flush();
  }
}

export { Codecs };
