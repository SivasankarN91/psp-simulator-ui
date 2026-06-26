import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚡ PSP Simulator
      </Link>
      <ul className="navbar-links">
        <li><Link to="/">Simulate</Link></li>
        <li><Link to="/logs">Logs</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;