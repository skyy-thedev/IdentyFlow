import { useState, useRef } from "react";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCamera, 
  FiEdit2,
  FiShield,
  FiCheck,
  FiX
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "../styles/UserProfile.css";

export default function UserProfile({ showToast, onClose }) {
  const { user, login } = useAuth();
  const fileInputRef = useRef(null);
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    nome: user?.nome || "",
    email: user?.email || "",
    telefone: user?.telefone || "",
    foto: user?.foto || ""
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "god":
        return { text: "Deus Master", color: "#a78bfa", icon: "👑" };
      case "admin":
        return { text: "Administrador", color: "#fbbf24", icon: "⭐" };
      case "instrutor":
        return { text: "Instrutor", color: "#60a5fa", icon: "📚" };
      default:
        return { text: "Usuário", color: "#9ca3af", icon: "👤" };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    if (editing) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      showToast?.("Por favor, selecione uma imagem", "error");
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast?.("A imagem deve ter no máximo 2MB", "error");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData(prev => ({ ...prev, foto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const res = await api.put(`/users/${user.id}`, {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        foto: formData.foto
      });
      
      // Atualizar o contexto de auth com os novos dados
      const updatedUser = res.data;
      login({
        id: updatedUser._id || user.id,
        nome: updatedUser.nome,
        email: updatedUser.email,
        role: updatedUser.role || user.role,
        telefone: updatedUser.telefone,
        foto: updatedUser.foto
      }, localStorage.getItem("token"));
      
      showToast?.("Perfil atualizado com sucesso!", "success");
      setEditing(false);
      setPreview(null);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      showToast?.("Erro ao atualizar perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: user?.nome || "",
      email: user?.email || "",
      telefone: user?.telefone || "",
      foto: user?.foto || ""
    });
    setPreview(null);
    setEditing(false);
  };

  const roleBadge = getRoleBadge(user?.role);
  const displayPhoto = preview || formData.foto || null;

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="profile-header">
          <div 
            className={`profile-photo ${editing ? "editable" : ""}`}
            onClick={handlePhotoClick}
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt="Foto do perfil" />
            ) : (
              <div className="photo-placeholder">
                {formData.nome?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            {editing && (
              <div className="photo-overlay">
                <FiCamera />
                <span>Alterar</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            hidden
          />
          
          <div className="profile-name">
            <h2>{formData.nome}</h2>
            <span className="role-badge" style={{ borderColor: roleBadge.color, color: roleBadge.color }}>
              {roleBadge.icon} {roleBadge.text}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>
              <FiUser /> Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="Seu nome"
            />
          </div>

          <div className="form-group">
            <label>
              <FiMail /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label>
              <FiPhone /> Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group readonly">
            <label>
              <FiShield /> Nível de Acesso
            </label>
            <input
              type="text"
              value={roleBadge.text}
              disabled
            />
            <small>O nível de acesso só pode ser alterado por um administrador</small>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                  <FiX /> Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Salvando..." : <><FiCheck /> Salvar</>}
                </button>
              </>
            ) : (
              <button type="button" className="btn-edit" onClick={() => setEditing(true)}>
                <FiEdit2 /> Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
