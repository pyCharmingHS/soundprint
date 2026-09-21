import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'

// The actual page routes live inside PageTransition (as a nested <Routes
// location={...}>), not here — see that file for why: it needs to own the
// location it resolves against so an exiting page's hooks (useSearchParams
// et al.) don't start reflecting the *new* URL mid fade-out.
export const router = createBrowserRouter(
  [{ path: '/*', element: <RootLayout /> }],
  { basename: import.meta.env.BASE_URL },
)
