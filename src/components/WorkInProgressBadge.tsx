import { useLocale } from '../i18n/LocaleContext'

interface WorkInProgressBadgeProps {
  className?: string
}

function WorkInProgressBadge({ className = '' }: WorkInProgressBadgeProps) {
  const { t } = useLocale()
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] tracking-wide whitespace-nowrap text-gold uppercase ${className}`}
    >
      🚧 {t('common.workInProgress')}
    </span>
  )
}

export default WorkInProgressBadge
