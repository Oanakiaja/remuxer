"use client";
import { Info } from "@/components/info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Video from "@/components/video";
import { Codecs } from "@/lib/codecs";
import { FileInput } from "@/lib/files";
import DeMuxer from "@/lib/mux/demuxer";
import Muxer from "@/lib/mux/muxer";
import { type ChangeEventHandler, useRef, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [webmUrl, setWebmUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<Mp4Info | undefined>();
  const fileArrayBufferRef = useRef<ArrayBuffer>();

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
    fileArrayBufferRef.current = fileArrayBuffer;
    const mux = new DeMuxer();
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
    if (!videoInfo || !fileArrayBufferRef.current) {
      return;
    }


    
    const decodeConfig = {
      v: {
        codec: videoInfo.videoTracks[0].codec,
        width: videoInfo.videoTracks[0]?.video?.width,
        height: videoInfo.videoTracks[0]?.video?.height,
        // description: FIXME:
        // hardwareAcceleration: "prefer-hardware" as const, // vp8 not support
      },
      a: {
        codec: videoInfo.audioTracks[0].codec,
        sampleRate: videoInfo.audioTracks[0]?.audio.sample_rate,
        numberOfChannels: videoInfo.audioTracks[0]?.audio.channel_count,
        bitrate: videoInfo.audioTracks[0].bitrate,
      },
    };

    const muxer = new Muxer({
      height: decodeConfig.v.height,
      width: decodeConfig.v.width,
    });

    const codecs = new Codecs({
      decodeConfig,
      encodeConfig: {
        v: {
          ...decodeConfig.v,
          codec: "vp8",
        },
        a: {
          ...decodeConfig.a,
          codec: "opus",
        },
        handler: {
          handleEncodedVideoChunk: muxer.addVideoChunk,
          handleEncodedAudioChunk: muxer.addAudioChunk,
        },
      },
    });

    const videoChunkIFrame = new EncodedVideoChunk({
      type: "key",
      timestamp: 0,
      data: fileArrayBufferRef.current,
    });
    codecs.decode(videoChunkIFrame);

    await codecs.flush();
    const buffer = await muxer.getWebm();
    const blob = new Blob([buffer], { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    setWebmUrl(url);
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
            Convert Mp4 to Webm
          </Button>
          <div>
            <h2>Converted video (webm)</h2>
            <Video src={webmUrl} autoPlay controls muted />
            <Button disabled={!webmUrl} className="my-4 h-16 w-full">
              <a href={webmUrl} download="video.webm">
                download
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
