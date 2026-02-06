import { Link, useLocation } from "wouter";
import { INavLink } from "../../types/INavLink";

export const NavLink = ({ link }: { link: INavLink }) => {
  const [location] = useLocation();

  return (
    <div className="flex-1 group" key={link.name}>
      <Link
        href={link.href}
        className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full text-white/60 group-hover:text-secondary ${
          location === link.href ? "text-secondary" : ""
        }`}
      >
        <span className="px-1 pt-1 pb-1 flex flex-col items-center">
          {link.icon}
          <span className="block text-xs pb-2">{link.name}</span>
          <span
            className={`lock w-5 mx-auto h-1 rounded-full ${
              location === link.href ? "bg-secondary" : ""
            }`}
          ></span>
        </span>
      </Link>
    </div>
  );
};
