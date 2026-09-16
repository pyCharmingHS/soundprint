import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import LanguagePicker from './LanguagePicker'

function renderPicker() {
  return render(
    <LocaleProvider>
      <LanguagePicker />
    </LocaleProvider>,
  )
}

describe('LanguagePicker', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the current locale on the trigger button', () => {
    renderPicker()
    // The 'en'/'es' code text is lowercase in the DOM — uppercase is a CSS
    // display transform (text-transform), not an actual text content change.
    expect(screen.getByRole('button', { name: /change language/i })).toHaveTextContent('en')
  })

  it('opens a menu listing all four locales', () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /change language/i }))
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
    expect(screen.getByText('Italiano')).toBeInTheDocument()
    expect(screen.getByText('Português')).toBeInTheDocument()
  })

  it('switches locale on selection, closing the menu and re-translating the trigger', async () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /change language/i }))
    fireEvent.click(screen.getByText('Español'))

    // The menu exit is animated (Framer Motion), so the node lingers briefly.
    await waitFor(() => expect(screen.queryByText('Italiano')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /cambiar idioma/i })).toHaveTextContent('es')
  })

  it('closes the menu on an outside click', async () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /change language/i }))
    expect(screen.getByText('Italiano')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByText('Italiano')).not.toBeInTheDocument())
  })
})
