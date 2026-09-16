import { useLocale } from '../i18n/LocaleContext'
import AlbumArtPattern from './AlbumArtPattern'

interface AlbumArtProps {
  src?: string
  title: string
  artist: string
  className?: string
}

function AlbumArt({ src, title, artist, className = '' }: AlbumArtProps) {
  const { t } = useLocale()
  const alt = t('common.by', { title, artist })

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-sm border border-border bg-surface shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <AlbumArtPattern title={title} artist={artist} alt={alt} />
      )}
    </div>
  )
}

export default AlbumArt
