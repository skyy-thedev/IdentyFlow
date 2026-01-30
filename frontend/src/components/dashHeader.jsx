import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserProfile from "./UserProfile";
import "../styles/dashHeader.css";

export default function DashHeader({ showToast }) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  if (!user) return null;

  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nome) + "&background=6366f1&color=fff";

  const getRoleBadge = (role) => {
    switch (role) {
      case "god": return { text: "Master", color: "#a78bfa" };
      case "admin": return { text: "Admin", color: "#fbbf24" };
      case "instrutor": return { text: "Instrutor", color: "#60a5fa" };
      default: return { text: "Usuário", color: "#9ca3af" };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <>
      <header className="dash-header">
        
        {/* LEFT MENU */}
        <div className="dash-left">
          <button 
            className="dash-btn"
            onClick={() => setShowProfile(true)}
          >
            ⚙ Config.
          </button>
        </div>

        {/* CENTER WELCOME */}
        <div className="dash-center">
          <h1>Bem-vindo de volta, <strong>{user.nome?.split(" ")[0]}</strong> 👋</h1>
          <p className="user-role">
            <span 
              className="role-tag" 
              style={{ backgroundColor: roleBadge.color + "20", color: roleBadge.color }}
            >
              {roleBadge.text}
            </span>
          </p>
        </div>

        {/* RIGHT USER BOX */}
        <div className="dash-right" onClick={() => setShowProfile(true)}>
          <div className="dash-info">
            <span className="name">{user.nome}</span>
            <span className="role" style={{ color: roleBadge.color }}>{roleBadge.text}</span>
          </div>
          <img 
            src={user.foto || defaultAvatar} 
            alt="avatar" 
            className="dash-avatar" 
          />
        </div>

      </header>

      {showProfile && (
        <UserProfile 
          showToast={showToast} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </>
  );
}
