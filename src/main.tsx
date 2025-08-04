import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Lists from "./pages/Lists";
import AlbumDetails from "./pages/AlbumDetails";
import ArtistPage from "./pages/ArtistPage";
import EmailVerification from "./pages/EmailVerifications";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserAlbumProvider } from "./contexts/UserAlbumContext";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      { path: "/Profile", element: <Profile /> },
      {
        path: "/Lists",
        element: (
          <ProtectedRoute>
            <Lists />
          </ProtectedRoute>
        ),
      },
      {
        path: "/AlbumDetails/:artist/:album",
        element: (
          <ProtectedRoute>
            <AlbumDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ArtistPage/:artist",
        element: (
          <ProtectedRoute>
            <ArtistPage />
          </ProtectedRoute>
        ),
      },
      { path: "/verify-email", element: <EmailVerification /> }, // Keep verification page unprotected
    ],
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <UserAlbumProvider>
        <RouterProvider router={router} />
      </UserAlbumProvider>
    </AuthProvider>
  </StrictMode>
);
