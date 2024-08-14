class Codecs {
  vDecoder: VideoDecoder;
  vEncoder: VideoEncoder;
  aDecoder: AudioDecoder;
  aEncoder: AudioEncoder;

  constructor({
    decodeConfig,
    encodeConfig,
  }: {
    decodeConfig: {
      v: VideoDecoderConfig;
      a: AudioDecoderConfig;
    };
    encodeConfig: {
      v: VideoEncoderConfig;
      a: AudioDecoderConfig;
    };
  }) {
    const [vDecoder, aDecoder] = this._createDecoder(decodeConfig);
    const [vEncoder, aEncoder] = this._createEncoder(encodeConfig);
    this.vDecoder = vDecoder;
    this.aDecoder = aDecoder;
    this.vEncoder = vEncoder;
    this.aEncoder = aEncoder;
  }

  private _createDecoder(decodeConfig: {
    v: VideoDecoderConfig;
    a: AudioDecoderConfig;
  }) {
    const vDecoder = new VideoDecoder({
      output: this.handleDecodedVideoFrame,
      error: (e) => console.error(e),
    });

    const aDecoder = new AudioDecoder({
      output: this.handleDecodedAudioData,
      error: (e) => console.error(e),
    });

    vDecoder.configure(decodeConfig.v);
    aDecoder.configure(decodeConfig.a);

    return [vDecoder, aDecoder] as const;
  }

  private _createEncoder(encodeConfig: {
    v: VideoEncoderConfig;
    a: AudioDecoderConfig;
  }) {
    // webm
    // v:
    // VP8
    // VP9
    // AV1
    // a:
    // Vorbis
    // Opus

    const vEncoder = new VideoEncoder({
      output: this.handleEncodedVideoChunk,
      error: (e) => console.error(e),
    });

    const aEncoder = new AudioEncoder({
      output: this.handleEncodedAudioChunk,
      error: (e) => console.error(e),
    });

    vEncoder.configure(encodeConfig.v);
    aEncoder.configure(encodeConfig.a);

    return [vEncoder, aEncoder] as const;
  }

  handleDecodedVideoFrame(frame: VideoFrame) {
    this.vEncoder.encode(frame);
    frame.close();
  }

  handleEncodedVideoChunk(chunk: EncodedVideoChunk) {
    console.log("Encoded video chunk:", chunk);
  }

  handleDecodedAudioData(data: AudioData) {
    this.aEncoder.encode(data);
    data.close();
  }

  // 处理编码后的音频数据块
  handleEncodedAudioChunk(chunk: EncodedAudioChunk) {
    console.log("Encoded audio chunk:", chunk);
  }
}
