declare module "mp4box" {
  export function createFile(): {
    appendBuffer: (buffer: ArrayBuffer) => void;
    onReady: (info: Mp4Info) => void;
    onError: (e: any) => void;
    flush: () => void;
  };
}

type Mp4Info = {
  duration: number;
  timescale: number;
  isFragmented: boolean;
  isProgressive: boolean;
  hasIOD: boolean;
  brands: string[];
  created: string;
  modified: string;
  tracks: (AudioTrack | VideoTrack)[];
  audioTracks: AudioTrack[];
  videoTracks: VideoTrack[];
};

type Track = {
  id: number;
  created: string;
  modified: string;
  movie_duration: number;
  layer: number;
  alternate_group: number;
  volume: number;
  track_width: number;
  track_height: number;
  timescale: number;
  duration: number;
  bitrate: number;
  codec: string;
  language: string;
  nb_samples: number;
};

type VideoTrack = Track & {
  video: {
    width: number;
    height: number;
  };
};

type AudioTrack = Track & {
  audio: {
    sample_rate: number;
    channel_count: number;
    sample_size: number;
  };
};
