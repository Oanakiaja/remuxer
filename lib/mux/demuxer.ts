// copy from  w3c/webcodecs/samples/video-decode-display/demuxer_mp4.js
import {
  DataStream,
  MP4VideoTrack,
  MP4ArrayBuffer,
  MP4Sample,
  createFile,
  MP4Track,
  MP4File,
  MP4Info,
} from "mp4box";

class MP4FileSink {
  #file: MP4File;
  #offset = 0;

  constructor(file: MP4File) {
    this.#file = file;
  }

  write(chunk: Uint8Array) {
    const buffer = new ArrayBuffer(chunk.byteLength) as MP4ArrayBuffer;
    new Uint8Array(buffer).set(chunk);

    buffer.fileStart = this.#offset;
    this.#offset += buffer.byteLength;

    this.#file.appendBuffer(buffer);
  }

  close() {
    this.#file.flush();
  }
}

// 现在你可以使用newStream的pipeTo或pipeThrough方法
type EnCodecConfig = {
  codec: string;
  height: number;
  width: number;
  description: any;
};

export class MP4Demuxer {
  onChunk?: (chunk: EncodedVideoChunk) => void;
  // #setStatus = null;
  #file: MP4File;
  track?: MP4VideoTrack;
  config: Promise<EnCodecConfig>;
  info: Promise<MP4Info>;
  // finish: Promise<boolean>;

  constructor(fileReadStream: ReadableStream<Uint8Array>) {
    this.#file = createFile();

    let resolveConfig: (value: EnCodecConfig) => void;
    const config: Promise<EnCodecConfig> = new Promise((resolve) => {
      resolveConfig = resolve;
    });

    let resolveInfo: (value: MP4Info) => void;
    const info: Promise<MP4Info> = new Promise((resolve) => {
      resolveInfo = resolve;
    });

    const that = this;
    this.#file.onReady = (info: MP4Info) => {
      const config = that.#getConfig(info);
      resolveConfig(config);
      resolveInfo(info);
    };

    this.config = config;
    this.info = info;


    this.#file.onSamples = this.#onSamples.bind(this);
    // Fetch the file and pipe the data through.
    const fileSink = new MP4FileSink(this.#file);
    // highWaterMark should be large enough for smooth streaming, but lower is
    // better for memory usage.
    fileReadStream.pipeTo(new WritableStream(fileSink, { highWaterMark: 2 }));
  }

  // Get the appropriate `description` for a specific track. Assumes that the
  // track is H.264, H.265, VP8, VP9, or AV1.
  #description(track: MP4Track) {
    const trak = this.#file.getTrackById(track.id);
    if (!trak?.mdia?.minf?.stbl?.stsd?.entries) {
      throw new Error("avcC, hvcC, vpcC, or av1C box not found");
    }
    for (const entry of trak?.mdia?.minf?.stbl?.stsd?.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
      if (box) {
        const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
        box.write(stream);
        return new Uint8Array(stream.buffer, 8); // Remove the box header.
      }
    }
  }

  #getConfig(info: MP4Info) {
    // this.#setStatus("demux", "Ready");
    const track = info.videoTracks[0];
    this.track = track;
    return {
      // Browser doesn't support parsing full vp8 codec (eg: `vp08.00.41.08`),
      // they only support `vp8`.
      codec: track.codec.startsWith("vp08") ? "vp8" : track.codec,
      height: track.video.height,
      width: track.video.width,
      description: this.#description(track),
    };
  }

  start() {
    if (!this.track) {
      throw Error("no track");
    }

    this.#file.setExtractionOptions(this.track.id);
    this.#file.start();
  }

  #onSamples(_id: number, _user: any, samples: MP4Sample[]) {
    if (!this.onChunk) {
      return;
    }
    for (const sample of samples) {
      this.onChunk(
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: (1e6 * sample.cts) / sample.timescale,
          duration: (1e6 * sample.duration) / sample.timescale,
          data: sample.data,
        })
      );
    }
  }
}
