import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '../types'
import CategoryCard from './CategoryCard'

const category: Category = {
  id: 'thinkers',
  name: 'The Thinkers',
  emoji: '🧠',
  description: 'Songs connected to ideas, philosophy, existentialism, meaning, worldview.',
}

describe('CategoryCard', () => {
  it('renders the emoji, name, and a title tooltip with the full description', () => {
    render(<CategoryCard category={category} />)
    expect(screen.getByText('🧠')).toBeInTheDocument()
    expect(screen.getByText('The Thinkers')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('title', category.description)
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CategoryCard category={category} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('reflects the active state visually', () => {
    render(<CategoryCard category={category} active />)
    expect(screen.getByRole('button').className).toContain('border-gold')
  })
})
