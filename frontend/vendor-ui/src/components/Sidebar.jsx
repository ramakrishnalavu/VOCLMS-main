import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>VOCLMS</h2>

      <Link to="/dashboard/vendors">Vendors</Link>
      <Link to="/dashboard/register">Register</Link>
      <Link to="/dashboard/stats">Stats</Link>

      <button onClick={() => {
        localStorage.clear();
        window.location.href = "/";
      }}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;