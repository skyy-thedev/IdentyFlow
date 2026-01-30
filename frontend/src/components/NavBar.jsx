import { useState, useEffect } from "react";
import { 
  FiHome, 
  FiUserPlus,
  FiUser, 
  FiBook, 
  FiBarChart2, 
  FiLogOut, 
  FiUsers,
  FiBookOpen,
  FiCreditCard,
  FiX
} from "react-icons/fi";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import LogoIdentyFlow from '../assets/pngs/Logo Principal IdenfyFlow.png';
import "../styles/NavBar.css";

export default function Sidebar({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [, setLocation] = useLocation();
  const { logout, user } = useAuth();
  const [activeItem, setActiveItem] = useState("Dashboard");

  // Detectar mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleItemClick(item) {
    setActiveItem(item.label);
    item.action();
    // Fechar menu no mobile após clicar
    if (isMobile) {
      setIsOpen(false);
    }
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
    icon: <FiHome size={24} />, 
    label: "Dashboard", 
    action: () => onSelect("dashboard") 
  });
  
  // Cadastro - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({ 
      icon: <FiUserPlus size={24} />, 
      label: "Cadastro", 
      action: () => onSelect("cadastro") 
    });
  }
  
  // Turmas - todos têm acesso (instrutor vê só as dele)
  menuItems.push({ 
    icon: <FiUser size={24} />, 
    label: "Turmas", 
    action: () => onSelect("turmas") 
  });
  
  // Histórico - todos têm acesso (instrutor vê só os dele)
  menuItems.push({ 
    icon: <FiBook size={24} />, 
    label: "Histórico", 
    action: () => onSelect("historico") 
  });
  
  // Analytics - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({ 
      icon: <FiBarChart2 size={24} />, 
      label: "Analytics", 
      action: () => onSelect("analytics") 
    });
  }

  // Cursos - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({
      icon: <FiBookOpen size={24} />,
      label: "Cursos",
      action: () => onSelect("cursos"),
    });
  }

  // Lista de Usuários - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({
      icon: <FiUsers size={24} />,
      label: "Lista de Usuários",
      action: () => onSelect("users"),
    });
  }

  // Planos/Assinatura - apenas admin e god
  if (user?.role === "admin" || user?.role === "god") {
    menuItems.push({
      icon: <FiCreditCard size={24} />,
      label: "Planos",
      action: () => setLocation("/planos"),
    });
  }

  // Logout sempre no final
  menuItems.push({
    icon: <FiLogOut size={24} />,
    label: "Logout",
    action: handleLogout,
  });

  return (
    <>
      {/* Botão Mobile para abrir menu - mostra logo do IdentyFlow */}
      {isMobile && !isOpen && (
        <button 
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menu"
        >
          <img src={LogoIdentyFlow} alt="Menu" />
        </button>
      )}

      {/* Overlay para fechar menu no mobile */}
      <div 
        className={`sidebar-overlay ${isMobile && isOpen ? "active" : ""}`} 
        onClick={() => setIsOpen(false)} 
      />

      <div className={`sidebar ${isOpen ? "open" : ""} ${isMobile ? "mobile" : ""}`}>
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
          {isMobile && isOpen && (
            <button className="close-sidebar" onClick={() => setIsOpen(false)}>
              <FiX size={24} />
            </button>
          )}
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
    </>
  );
}
