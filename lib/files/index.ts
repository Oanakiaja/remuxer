const FileInput = {
  getReadableStream: (file: File) => {
    const stream = file.stream();
    const reader = stream.getReader();
    return reader;
  },
  getFileArrayBuffer: async (
    file: File
  ): Promise<undefined | null | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (res) => {
        resolve(res.target?.result as ArrayBuffer);
      };
      fileReader.onerror = (err) => reject(err);

      fileReader.readAsArrayBuffer(file);
    });
  },
  getDataUrl: async (file: File): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (res) => {
        resolve(res.target?.result as string);
      };
      fileReader.onerror = (err) => reject(err);

      fileReader.readAsDataURL(file);
    });
  },
};

export { FileInput };
