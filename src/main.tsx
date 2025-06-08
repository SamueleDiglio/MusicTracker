import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Lists from './pages/Lists'
import AlbumDetails from './pages/AlbumDetails'
import Navbar from './components/Navbar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

const router = createBrowserRouter([
  {
    element: <Navbar />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/Profile", element: <Profile /> },
      { path: "/Lists", element: <Lists />},
      { path: "/AlbumDetails/:id", element: <AlbumDetails />}
    ]
  }
]);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);