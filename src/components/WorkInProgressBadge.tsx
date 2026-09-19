import { useLocale } from '../i18n/LocaleContext'

interface WorkInProgressBadgeProps {
  className?: string
  /** The nav's compact "WIP" form instead of the full "Work in Progress" text. */
  compact?: boolean
}

function WorkInProgressBadge({ className = '', compact }: WorkInProgressBadgeProps) {
  const { t } = useLocale()
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 tracking-wide whitespace-nowrap text-gold uppercase ${
        compact ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[10px]'
      } ${className}`}
    >
      🚧 {compact ? t('common.wip') : t('common.workInProgress')}
    </span>
  )
}

export default WorkInProgressBadge
