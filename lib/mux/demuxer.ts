import * as mp4box from "mp4box";

class DeMuxer {
  mp4box: ReturnType<typeof mp4box.createFile>;

  constructor() {
    this.mp4box = mp4box.createFile();
  }

  getInfo(buffer: ArrayBuffer): Promise<Mp4Info> {
    return new Promise((resolve, reject) => {
      this.mp4box.onError = (e) => {
        console.error(e);
        reject(e);
      };
      this.mp4box.onReady = (info) => {
        console.log(info);
        resolve(info);
      };

      // @ts-ignore
      buffer.fileStart = 0;
      this.mp4box.appendBuffer(buffer);
      this.mp4box.flush();
    });
  }
}

export default DeMuxer;
