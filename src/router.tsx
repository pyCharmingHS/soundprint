import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/HomePage'
import PantheonPage from './pages/PantheonPage'
import SongDetailPage from './pages/SongDetailPage'
import StatisticsPage from './pages/StatisticsPage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'pantheon', element: <PantheonPage /> },
        { path: 'song/:id', element: <SongDetailPage /> },
        { path: 'statistics', element: <StatisticsPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
