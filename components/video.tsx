const Video = (props: React.VideoHTMLAttributes<HTMLVideoElement>) => {
  return props.src ? (
    <video {...props} className="bg-black w-[640px] h-[360px]" />
  ) : (
    <div className="bg-black min-w-[640px] min-h-[360px]"></div>
  );
};

export default Video