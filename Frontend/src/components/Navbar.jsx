import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./navbar.css"; // Import CSS

const Navbar = ({role}) => {

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Car Rental</Link>
      </div>
      <ul className="nav-links">
        <li><NavLink to="/home" exact>Home</NavLink></li>
        <li><NavLink to="/account">Account</NavLink></li>
        <li><NavLink to="/requests">Requests</NavLink></li>
        {role === 'users' || <li><NavLink to="/addcar">AddCar</NavLink></li>}
        {console.log(role)}
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
