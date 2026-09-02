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
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-base ${
        active
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-border bg-surface hover:border-gold/50'
      }`}
    >
      <span className="text-base sm:text-lg">{category.emoji}</span>
      <span className="font-display">{category.name}</span>
    </button>
  )
}

export default CategoryCard
