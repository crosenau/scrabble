import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import './navbar.scss';

export default function Navbar() {
  const { user } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="nav">
      <div 
        className={!menuOpen ? "nav__button" : "nav__button--toggled"}
        onClick={toggleMenu}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="nav__logo">Scrabble</div>

      <ul 
        className="nav__vertical-items"
        style={!menuOpen ? { display: 'none' } : {}}
      >
        <li>
          <NavLink 
            to="/newgame" 
            className={({isActive}) => isActive ? 'nav__vertical-item--active' : 'nav__vertical-item'}
            onClick={toggleMenu}
          >
            New Game
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/mygames" 
            className={({isActive}) => isActive ? 'nav__vertical-item--active' : 'nav__vertical-item'}
            onClick={toggleMenu}
          >
            My Games
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/publicgames" 
            className={({isActive}) => isActive ? 'nav__vertical-item--active' : 'nav__vertical-item'}
            onClick={toggleMenu}
          >
            Public Games
          </NavLink>
        </li>
      </ul>

      <ul className="nav__items">
        <li>
          <NavLink 
            to="/newgame" 
            className={({isActive}) => isActive ? 'nav__item--active' : 'nav__item'}
          >
            New Game
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/mygames" 
            className={({isActive}) => isActive ? 'nav__item--active' : 'nav__item'}
          >
            My Games
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/publicgames" 
            className={({isActive}) => isActive ? 'nav__item--active' : 'nav__item'}
          >
            Public Games
          </NavLink>
        </li>
      </ul>
      <div className="nav__username">{user.name}</div>
    </nav>
  );
}