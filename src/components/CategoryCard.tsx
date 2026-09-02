import type { Category } from '../types'

interface CategoryCardProps {
  category: Category
  active?: boolean
  onClick?: () => void
}

function CategoryCard({ category, active, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={category.description}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
        active
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-border bg-surface hover:border-gold/50'
      }`}
    >
      <span className="text-lg">{category.emoji}</span>
      <span className="font-display">{category.name}</span>
    </button>
  )
}

export default CategoryCard
