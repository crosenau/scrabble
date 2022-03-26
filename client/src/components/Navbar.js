import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import './navbar.scss';

export default function Navbar() {
  const { user } = useContext(UserContext);

  return (
    <nav id="navbar">
      <div id="logo">Scrabble</div>
      <div id="nav-content">
        <ul>
          <li>
            <NavLink 
              to="/newgame" 
              className="nav-button" 
              //activeClassName="nav-button-selected" 
            >
              New Game
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/mygames" 
              className="nav-button" 
              //activeClassName="nav-button-selected" 
            >
              My Games
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/publicgames" 
              className="nav-button" 
              //activeClassName="nav-button-selected" 
            >
              Public Games
            </NavLink>
          </li>
        </ul>
        <div>{user.name}</div>
      </div>

    </nav>
  );
}