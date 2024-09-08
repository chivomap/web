import React from 'react';
import { NavLink } from './NavLink';
import { INavLink } from '../../types/INavLink'
import {
  IoCompassOutline as Map,
  IoHeartCircleOutline as Favorite,
  IoPersonCircleOutline as Account
} from "react-icons/io5";


const iconClass = "text-[2rem] pt-1 mb-1 block";

// Define los enlaces con sus respectivos íconos y rutas
export const Links: INavLink[] = [
  { name: "Map", href: "/", icon: <Map className={iconClass} /> },
  { name: "Saved", href: "/saved", icon: <Favorite className={iconClass} /> },
  { name: "Account", href: "/account", icon: <Account className={iconClass} /> },
];

export const LinksContainer: React.FC = () => {
  return (
    <>
      {Links.map((link) => (
        <NavLink key={link.name} link={link} />
      ))}
    </>
  );
};
