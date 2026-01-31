import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import AddUser from "./AddUser";
import "../styles/ListaUsuarios.css";

export default function ListaUsuarios() {
  const { user } = useAuth();
  const isGod = user?.role === "god";
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  
  // Estados para modais GOD
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: "", email: "", role: "", adminPai: "" });
  const [admins, setAdmins] = useState([]);

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users");
      setUsuarios(response.data.users || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setErro("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Funções para GOD
  const handleExcluirClick = (usuario) => {
    setSelectedUser(usuario);
    setShowConfirmDelete(true);
  };

  const handleConfirmExcluir = async () => {
    try {
      await api.delete(`/auth/users/${selectedUser._id}`);
      await fetchUsers();
      setShowConfirmDelete(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      alert("Erro ao excluir usuário");
    }
  };

  const handleEditarClick = async (usuario) => {
    setSelectedUser(usuario);
    setEditFormData({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      adminPai: usuario.adminPai?._id || ""
    });
    // Se GOD, buscar admins disponíveis
    if (isGod) {
      try {
        const res = await api.get("/auth/users");
        const adminsList = (res.data.users || []).filter(u => u.role === "admin");
        setAdmins(adminsList);
      } catch (err) {
        setAdmins([]);
      }
    }
    setShowEditModal(true);
  };

  const handleSalvarEdicao = async () => {
    try {
      const dataToSend = { ...editFormData };
      // Só enviar adminPai se GOD e não for admin
      if (!isGod || selectedUser.role === "admin") {
        delete dataToSend.adminPai;
      }
      await api.put(`/auth/users/${selectedUser._id}`, dataToSend);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Erro ao editar usuário:", err);
      alert("Erro ao editar usuário");
    }
  };

  if (loading) return <p className="loading">Carregando usuários...</p>;
  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div className="lista-container">
      
      <h2>{isGod ? "Todos os Usuários" : "Meus Instrutores"}</h2>
      <p>Total: <strong>{usuarios.length}</strong></p>

      {/* BOTÃO ADICIONAR */}
      <button className="btn-add" onClick={() => setShowAdd(true)}>
        + Adicionar Instrutor
      </button>

      {/* FORM ADD USER */}
      {showAdd && (
        <AddUser
          onClose={() => setShowAdd(false)}
          onUserAdded={() => {
            fetchUsers();
            setShowAdd(false);
          }}
        />
      )}


      {/* TABELA */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Função</th>
            {isGod && <th>Empresa/Admin</th>}
            {isGod && <th>Ações</th>}
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u._id}>
              <td data-label="Nome">{u.nome}</td>
              <td data-label="Email">{u.email}</td>
              <td data-label="Função" className={`role ${u.role}`}>{u.role}</td>
              {isGod && (
                <td data-label="Empresa">
                  {u.role === "admin" 
                    ? (u.nomeEmpresa || "—")
                    : u.adminPai?.nomeEmpresa || u.adminPai?.nome || "—"
                  }
                </td>
              )}
              {isGod && (
                <td data-label="Ações">
                  <div className="acoes-cell">
                    <button 
                      className="btn-acao editar" 
                      onClick={() => handleEditarClick(u)}
                      title="Editar usuário"
                      disabled={u.role === "god"}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      className="btn-acao excluir" 
                      onClick={() => handleExcluirClick(u)}
                      title="Excluir usuário"
                      disabled={u.role === "god"}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Confirmar Exclusão */}
      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir o usuário <strong>{selectedUser?.nome}</strong>?
              <br />
              <small style={{ color: "#ef4444" }}>Esta ação não pode ser desfeita.</small>
            </p>
            <div className="modal-actions">
              <button className="btn-modal cancelar" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </button>
              <button className="btn-modal confirmar" onClick={handleConfirmExcluir}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Editar Usuário</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Função</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  disabled={selectedUser?.role === "god"}
                >
                  <option value="instrutor">Instrutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {/* GOD pode editar adminPai de instrutores */}
              {isGod && editFormData.role === "instrutor" && (
                <div className="form-group">
                  <label>Admin Responsável</label>
                  <select
                    value={editFormData.adminPai || ""}
                    onChange={e => setEditFormData({ ...editFormData, adminPai: e.target.value })}
                  >
                    <option value="">— Nenhum —</option>
                    {admins.map(a => (
                      <option key={a._id} value={a._id}>{a.nomeEmpresa || a.nome || a.email}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-modal cancelar" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button className="btn-modal salvar" onClick={handleSalvarEdicao}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

