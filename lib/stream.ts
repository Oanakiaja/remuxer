export function readerToStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      // 递归函数来读取数据并推送到流的控制器中
      function pump() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              // 当没有更多数据可读时，关闭流
              controller.close();
              return;
            }
            // 将数据块推送到流中
            controller.enqueue(value);
            // 继续读取下一个数据块
            pump();
          })
          .catch((err) => {
            // 处理可能出现的错误
            controller.error(err);
          });
      }

      // 开始从reader读取数据
      pump();
    },
    cancel() {
      // 当流被取消时，释放reader
      reader.releaseLock();
    },
  });
}
