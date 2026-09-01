interface AlbumArtProps {
  src?: string
  alt: string
  className?: string
}

function initials(alt: string) {
  return alt
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

function AlbumArt({ src, alt, className = '' }: AlbumArtProps) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-sm border border-border bg-surface shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-2xl text-gold/70">
            {initials(alt)}
          </span>
        </div>
      )}
    </div>
  )
}

export default AlbumArt
