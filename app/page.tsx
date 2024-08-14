"use client";
import { Info } from "@/components/info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Video from "@/components/video";
import { FileInput } from "@/lib/files";
import Muxer from "@/lib/mux";
import { type ChangeEventHandler, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<Mp4Info | undefined>();

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const fileArrayBuffer = await FileInput.getFileArrayBuffer(file);
    if (!fileArrayBuffer) {
      return;
    }
    const mux = new Muxer();
    const info = await mux.getInfo(fileArrayBuffer);
    setVideoInfo(info);
    handleVideoShow(file);
  };

  const handleVideoShow = async (file: File) => {
    const dataUrl = await FileInput.getDataUrl(file);
    if (!dataUrl) return;
    setVideoUrl(dataUrl);
  };

  const handleMuxer = async () => {
    if (!videoInfo) {
      return;
    }

    const decodeConfig = {
      v: {
        codec: videoInfo.videoTracks[0].codec,
        width: videoInfo.videoTracks[0]?.video?.width,
        height: videoInfo.videoTracks[0]?.video?.height,
        hardwareAcceleration: "prefer-hardware" as const,
      },
      a: {
        codec: videoInfo.audioTracks[0].codec,
        sampleRate: videoInfo.audioTracks[0]?.audio.sample_rate,
        numberOfChannels: videoInfo.audioTracks[0]?.audio.channel_count,
        bitrate: videoInfo.audioTracks[0].bitrate,
      },
    };

    const codecs = new Codecs({
      decodeConfig,
      encodeConfig: {
        v: {
          ...decodeConfig.v,
          codec: "vp9",
        },
        a: {
          ...decodeConfig.a,
          codec: "opus",
        },
      },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-blue-500">Convert mp4 to webm</h1>
        <div className="flex flex-col ">
          <div>
            <h2>Choose a video file to convert(mp4)</h2>
            <Input type="file" accept="video/mp4" onChange={handleFileChange} />
            <Info videoInfo={videoInfo} />
            <Video src={videoUrl} autoPlay controls muted />
          </div>
          <Button
            className="my-4 h-16"
            disabled={!videoInfo}
            onClick={handleMuxer}
          >
            remuxer!
          </Button>
          <div>
            <h2>
              <span className="text-yellow-400">TODO: </span> Converted video{" "}
              (webm)
            </h2>
            <Video src={videoUrl} autoPlay controls muted />
          </div>
        </div>
      </div>
    </main>
  );
}
