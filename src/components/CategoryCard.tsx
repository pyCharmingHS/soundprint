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
      className={`flex flex-col items-start gap-1 rounded-sm border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-gold bg-gold/10'
          : 'border-border bg-surface hover:border-gold/50'
      }`}
    >
      <span className="text-2xl">{category.emoji}</span>
      <span className="font-display text-lg">{category.name}</span>
      {category.description && (
        <span className="text-sm text-muted">{category.description}</span>
      )}
    </button>
  )
}

export default CategoryCard
