interface AlbumArtProps {
  src?: string
  title: string
  artist: string
  className?: string
}

function initial(value: string): string {
  return value.trim().charAt(0).toUpperCase()
}

function AlbumArt({ src, title, artist, className = '' }: AlbumArtProps) {
  const alt = `${title} by ${artist}`

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-sm border border-border bg-surface shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 100 100" role="img" aria-label={alt} className="h-full w-full">
          <text
            x="38"
            y="42"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="38"
            fill="var(--color-gold)"
            fillOpacity="0.85"
            className="font-display"
          >
            {initial(title)}
          </text>
          <text
            x="58"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="38"
            fill="var(--color-gold)"
            fillOpacity="0.4"
            className="font-display"
          >
            {initial(artist)}
          </text>
        </svg>
      )}
    </div>
  )
}

export default AlbumArt
