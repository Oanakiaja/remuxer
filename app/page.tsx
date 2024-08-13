"use client";
import { Info } from "@/components/info";
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
          <div>
            <h2>
              <span className="text-yellow-400">TODO: </span> Converted video{" "} (webm)
            </h2>
            <Video src={videoUrl} autoPlay controls muted />
          </div>
        </div>
      </div>
    </main>
  );
}
