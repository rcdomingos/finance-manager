import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

export const SidebarItem = ({ icon: Icon, label, to }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );
};
