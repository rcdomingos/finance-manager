import { useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Tags,
  Landmark,
  CreditCard,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import clsx from "clsx";
import { NavLink } from "react-router-dom";

export const Sidebar = () => {
  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(true);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">FinManager</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
        <SidebarItem
          icon={ArrowRightLeft}
          label="Lançamentos"
          to="/transactions"
        />
        <SidebarItem icon={PieChart} label="Relatórios" to="/reports" />

        {/* Grupo Cadastros (Expansível) */}
        <div className="pt-4">
          <button
            onClick={() => setIsRegistrationsOpen(!isRegistrationsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} />
              <span>Cadastros</span>
            </div>
            {isRegistrationsOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Submenu */}
          <div
            className={clsx(
              "pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300",
              isRegistrationsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <SidebarItem icon={Tags} label="Categorias" to="/categories" />
            <SidebarItem icon={Landmark} label="Minhas Contas" to="/accounts" />
            <SidebarItem icon={CreditCard} label="Meus Cartões" to="/cards" />
          </div>
        </div>
      </nav>

      {/* Footer User Area*/}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            US
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700">Usuário</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
