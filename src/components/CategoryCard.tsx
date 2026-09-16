import { useLocale } from '../i18n/LocaleContext'
import type { Category } from '../types'

interface CategoryCardProps {
  category: Category
  active?: boolean
  onClick?: () => void
}

function CategoryCard({ category, active, onClick }: CategoryCardProps) {
  const { localize } = useLocale()
  const name = localize(category.name)
  const description = localize(category.description)

  return (
    <button
      type="button"
      onClick={onClick}
      title={description}
      className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-base ${
        active
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-border bg-surface hover:border-gold/50'
      }`}
    >
      <span className="text-base sm:text-lg">{category.emoji}</span>
      <span className="font-display">{name}</span>
    </button>
  )
}

export default CategoryCard
