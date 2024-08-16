import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { MP4Info } from "mp4box";
dayjs.extend(duration);

export const Info = ({ videoInfo }: { videoInfo?: MP4Info }) => {
  if (!videoInfo) {
    return <div>no video info</div>;
  }
  return (
    <div>
      <div>info</div>
      <div>
        <div>
          duration:{dayjs.duration(videoInfo?.duration).format("HH:mm:ss")}
        </div>
        <div>video codec:{videoInfo?.videoTracks?.[0]?.codec}</div>
        <div>video width:{videoInfo?.videoTracks?.[0]?.video?.width}</div>
        <div>video height:{videoInfo?.videoTracks?.[0]?.video?.height}</div>
        <div>audio codec: {videoInfo?.audioTracks?.[0]?.codec}</div>
        <div>
          audio sample rate:{videoInfo?.audioTracks[0]?.audio?.sample_rate}
        </div>
        <div>
          audio channels:{videoInfo?.audioTracks[0]?.audio?.channel_count}
        </div>
      </div>
    </div>
  );
};
