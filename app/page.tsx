"use client";
import { Info } from "@/components/info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Video from "@/components/video";
import { Codecs } from "@/lib/codecs";
import { FileInput } from "@/lib/files";
import { MP4Demuxer } from "@/lib/mux/demuxer";
import Muxer from "@/lib/mux/muxer";
import { readerToStream } from "@/lib/stream";
import { MP4Info } from "mp4box";
import { type ChangeEventHandler, useRef, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [webmUrl, setWebmUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<MP4Info | undefined>();
  const demuxRef = useRef<MP4Demuxer>();

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const fileStream = await FileInput.getReadableStream(file);
    const mux = new MP4Demuxer(readerToStream(fileStream));
    demuxRef.current = mux;
    setVideoInfo(await mux.info);
    handleVideoShow(file);
  };

  const handleVideoShow = async (file: File) => {
    const dataUrl = await FileInput.getDataUrl(file);
    if (!dataUrl) return;
    setVideoUrl(dataUrl);
  };

  const handleMuxer = async () => {
    if (!demuxRef.current) return;
    const config = await demuxRef.current.config;
    const decodeConfig = {
      v: config,
    };

    const muxer = new Muxer(
      {
        height: decodeConfig.v.height,
        width: decodeConfig.v.width,
      },
      (videoInfo?.duration! / videoInfo?.timescale!) * 1e6
    );

    const codecs = new Codecs({
      decodeConfig,
      encodeConfig: {
        v: {
          ...decodeConfig.v,
          codec: "vp8",
        },
        handler: {
          handleEncodedVideoChunk: muxer.addVideoChunk.bind(muxer),
        },
      },
    });

    demuxRef.current.onChunk = (chunk) => {
      codecs.decode(chunk);
    };
    demuxRef.current.start();
    // encode
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
            {/* <Button disabled={!webmUrl} className="my-4 h-16 w-full">
              <a href={webmUrl} download="video.webm">
                download
              </a>
            </Button> */}
          </div>
        </div>
      </div>
    </main>
  );
}
