import { useParams } from 'react-router-dom'

function SongDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex flex-1 items-center justify-center">
      <p>Song {id}</p>
    </div>
  )
}

export default SongDetailPage
