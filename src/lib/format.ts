export function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)} hours`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function mostCommonKey(
  record: Record<string, number> | undefined,
): string | undefined {
  if (!record) return undefined
  const entries = Object.entries(record)
  if (entries.length === 0) return undefined
  return entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0]
}

export function formatHourLabel(hour: string): string {
  const h = Number(hour)
  const period = h < 12 ? 'AM' : 'PM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour} ${period}`
}
