import { useState } from "react";
import { 
  FiHome, 
  FiUserPlus,
  FiUser, 
  FiBook, 
  FiBarChart2, 
  FiLogOut, 
  FiUsers,
  FiBookOpen   
} from "react-icons/fi";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import LogoIdentyFlow from '../assets/pngs/Logo Principal IdenfyFlow.png';
import "../styles/NavBar.css";

export default function Sidebar({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { logout, user } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // MENU PADRÃO'
  const menuItems = [
    { icon: <FiHome size={30} />, label: "Dashboard", action: () => onSelect("dashboard") },
    { icon: <FiUserPlus size={30} />, label: "Cadastro", action: () => onSelect("cadastro") },
    { icon: <FiUser size={30} />, label: "Turmas", action: () => onSelect("turmas") },
    { icon: <FiBook size={30} />, label: "Histórico", action: () => onSelect("historico") },
    { icon: <FiBarChart2 size={30} />, label: "Analytics", action: () => onSelect("analytics") },
  ];

  // 🔥 Aba CURSOS (somente Admin e God)
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({
      icon: <FiBookOpen    size={30} />,
      label: "Cursos",
      action: () => onSelect("cursos"),
    });
  }

  // 🔥 Lista de Usuários (somente Admin e God)
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({
      icon: <FiUsers size={30} />,
      label: "Lista de Usuários",
      action: () => onSelect("users"),
    });
  }

  // Logout sempre no final
  menuItems.push({
    icon: <FiLogOut size={30} />,
    label: "Logout",
    action: handleLogout,
  });

  return (
    <div className={isOpen ? "sidebar open" : "sidebar"}>
      {/* LOGO + BOTÃO */}
      <div className="sidebar-header">
        <div className="logo-area">
          <img
            src={LogoIdentyFlow}
            alt="logo"
            className="logo-img"
            onClick={toggleSidebar}
          />
          {isOpen && <h1 className="logo-text">IdentyFlow</h1>}
        </div>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item" onClick={item.action}>
            {item.icon}
            {isOpen && <span className="item-text">{item.label}</span>}
          </div>
        ))}
      </nav>
    </div>
  );
}
