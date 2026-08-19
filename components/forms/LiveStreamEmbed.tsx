interface LiveStreamEmbedProps {
  youtubeId?: string;
  isLive?: boolean;
  title?: string;
}

export default function LiveStreamEmbed({ youtubeId, isLive, title = 'Live service' }: LiveStreamEmbedProps) {
  if (!youtubeId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-card bg-navy text-white">
        <p className="text-lg font-semibold">No live stream is running right now.</p>
        <p className="text-sm text-white/70">Check back during our next service time.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card shadow-diocese">
      {isLive && (
        <div className="flex items-center gap-2 bg-red-700 px-4 py-2 text-sm font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
          Live Now
        </div>
      )}
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
