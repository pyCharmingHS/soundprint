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
      className={`flex h-40 w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors sm:h-48 sm:w-48 ${
        active
          ? 'border-gold bg-gold/10'
          : 'border-border bg-surface hover:border-gold/50'
      }`}
    >
      <span className="text-4xl">{category.emoji}</span>
      <span className="font-display text-xl">{category.name}</span>
      {category.description && (
        <span className="line-clamp-2 text-xs text-muted">{category.description}</span>
      )}
    </button>
  )
}

export default CategoryCard
