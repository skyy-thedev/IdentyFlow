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
  const [activeItem, setActiveItem] = useState("Dashboard");

  function handleItemClick(item) {
    setActiveItem(item.label);
    item.action(); // mantém a navegação/ação original
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // MENU baseado no ROLE do usuário
  const menuItems = [];
  
  // Dashboard - todos têm acesso
  menuItems.push({ 
    icon: <FiHome size={30} />, 
    label: "Dashboard", 
    action: () => onSelect("dashboard") 
  });
  
  // Cadastro - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({ 
      icon: <FiUserPlus size={30} />, 
      label: "Cadastro", 
      action: () => onSelect("cadastro") 
    });
  }
  
  // Turmas - todos têm acesso (instrutor vê só as dele)
  menuItems.push({ 
    icon: <FiUser size={30} />, 
    label: "Turmas", 
    action: () => onSelect("turmas") 
  });
  
  // Histórico - todos têm acesso (instrutor vê só os dele)
  menuItems.push({ 
    icon: <FiBook size={30} />, 
    label: "Histórico", 
    action: () => onSelect("historico") 
  });
  
  // Analytics - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({ 
      icon: <FiBarChart2 size={30} />, 
      label: "Analytics", 
      action: () => onSelect("analytics") 
    });
  }

  // Cursos - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({
      icon: <FiBookOpen size={30} />,
      label: "Cursos",
      action: () => onSelect("cursos"),
    });
  }

  // Lista de Usuários - apenas admin e god
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
          <div
            key={index}
            className={`menu-item ${item.label === activeItem ? "active" : ""}`}
            onClick={() => handleItemClick(item)}
          >
            {item.icon}
            {isOpen && <span className="item-text">{item.label}</span>}
          </div>
        ))}
      </nav>
    </div>
  );
}
