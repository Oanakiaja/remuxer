// const decoder = new VideoDecoder({
//   output: (frame) => handleFrame(frame),
//   error: (error) => console.error("Decoding error:", error),
// });
// const encoder = new VideoEncoder({
//   output: (chunk) => handleChunk(chunk),
//   error: (error) => console.error("Encoding error:", error),
// });

// decoder.configure({
//   codec: "avc1.42E01E",
//   codedWidth: 640,
//   codedHeight: 480,
// });

// encoder.configure({
//   codec: "vp09.00.10.08",
//   width: 640,
//   height: 480,
//   bitrate: 1000000,
//   framerate: 30,
// });

// decoder.decode(
//   new EncodedVideoChunk({
//     type: "key",
//     timestamp: 0,
//     data: new Uint8Array(fileBuffer),
//   })
// );

// function handleFrame(videoFrame) {
//   console.log("Frame decoded", videoFrame);
//   encoder.encode(videoFrame);
//   videoFrame.close();
// }

// function handleChunk(encodedChunk) {
//   console.log("Chunk encoded", encodedChunk);
//   // 这里可以将编码的数据块保存或进一步处理
// }