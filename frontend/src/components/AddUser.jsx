import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AddUser.css";

export default function AddUser({ onClose, onUserAdded }) {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [role, setRole] = useState("instrutor");
  const [adminPai, setAdminPai] = useState("");
  const [instrutoresSemAdmin, setInstrutoresSemAdmin] = useState([]);
  const [instrutorExistenteId, setInstrutorExistenteId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [senhaExibida, setSenhaExibida] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // Gera senha automática (frontend só para exibir, backend gera real)
  const gerarSenhaPreview = () => {
    if (!nome || telefone.length < 4) return "";
    const nome4 = nome.slice(0, 4).toLowerCase();
    const tel4 = telefone.slice(-4);
    const random = Math.random().toString(36).slice(-3);
    return nome4 + tel4 + random;
  };

  // Buscar admins e instrutores sem admin (para GOD)
  useEffect(() => {
    if (user?.role === "god") {
      api.get("/auth/users").then(res => {
        setAdmins((res.data.users || []).filter(u => u.role === "admin"));
      });
      api.get("/auth/instrutores-sem-admin").then(res => {
        setInstrutoresSemAdmin(res.data.instrutores || []);
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setSenhaExibida("");

    try {
      // GOD pode vincular instrutor existente
      if (user?.role === "god" && instrutorExistenteId) {
        await api.post("/auth/instrutor", {
          instrutorExistenteId,
          adminPai: adminPai || undefined
        });
        alert("Instrutor vinculado com sucesso!");
        onUserAdded();
        onClose?.();
        return;
      }

      // Criação de novo usuário
      const payload = {
        nome,
        email,
        telefone,
        role,
        adminPai: user?.role === "god" && role === "instrutor" ? (adminPai || undefined) : undefined
      };
      const resp = await api.post("/auth/instrutor", payload);
      setSenhaExibida(resp.data.senhaGerada || "");
      alert(`${role === "admin" ? "Admin" : "Instrutor"} criado com sucesso!\nSenha: ${resp.data.senhaGerada || "-"}`);
      onUserAdded();
      onClose?.();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.msg || "Erro ao criar usuário.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{user?.role === "god" ? "Cadastrar Novo Usuário" : "Cadastrar Novo Instrutor"}</h2>

        {user?.role === "god" && (
          <>
            <div className="form-group">
              <label>Tipo de usuário</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="instrutor">Instrutor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vincular instrutor já existente</label>
              <select value={instrutorExistenteId} onChange={e => setInstrutorExistenteId(e.target.value)}>
                <option value="">— Nenhum —</option>
                {instrutoresSemAdmin.map(i => (
                  <option key={i._id} value={i._id}>{i.nome} ({i.email})</option>
                ))}
              </select>
              <small>Se selecionar, só fará a vinculação (não criará novo usuário)</small>
            </div>
            {role === "instrutor" && (
              <div className="form-group">
                <label>Admin responsável</label>
                <select value={adminPai} onChange={e => setAdminPai(e.target.value)}>
                  <option value="">— Nenhum —</option>
                  {admins.map(a => (
                    <option key={a._id} value={a._id}>{a.nomeEmpresa || a.nome || a.email}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {user?.role !== "god" && (
          <p className="info-text">
            O instrutor será vinculado à sua conta e terá acesso limitado ao sistema.
          </p>
        )}

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Se for GOD e for vinculação, não mostra campos de novo usuário */}
          {!(user?.role === "god" && instrutorExistenteId) && (
            <>
              <div className="form-group">
                <label>Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Senha gerada automaticamente</label>
                <input type="text" value={gerarSenhaPreview()} disabled />
                <small>A senha real será exibida após o cadastro.</small>
              </div>
            </>
          )}
          {senhaExibida && (
            <div className="form-group">
              <label>Senha gerada</label>
              <input type="text" value={senhaExibida} readOnly />
              <small>Copie e entregue ao usuário.</small>
            </div>
          )}
          <button
            type="submit"
            className="btn-save-user"
            disabled={submitting}
          >
            {submitting ? "Salvando..." : user?.role === "god" && role === "admin" ? "Salvar Admin" : "Salvar Instrutor"}
          </button>
        </form>
      </div>
    </div>
  );
}
