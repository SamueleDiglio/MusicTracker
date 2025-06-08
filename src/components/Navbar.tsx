import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav
        style={{
          padding: "1rem",
          backgroundColor: "#1a1a1a",
          marginBottom: "2rem",
        }}
      >
        <ul
          style={{
            display: "flex",
            gap: "2rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link to="/">Home</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/Lists">My Albums</Link>
              </li>
              <li>
                <Link to="/Profile">Profile</Link>
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/Profile">Login</Link>
            </li>
          )}
        </ul>
      </nav>
      <main style={{ padding: "0 1rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Navbar;
