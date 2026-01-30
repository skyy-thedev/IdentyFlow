import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AddUser.css";

export default function AddUser({ onClose, onUserAdded }) {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Gera senha automática
  const gerarSenha = () => {
    if (!nome || telefone.length < 4) return "";

    const nome4 = nome.slice(0, 4).toLowerCase();
    const tel4 = telefone.slice(-4);
    const random = Math.random().toString(36).slice(-3);

    return nome4 + tel4 + random;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const senhaGerada = gerarSenha();
    
    if (!senhaGerada) {
      setError("Preencha nome e telefone corretamente");
      setSubmitting(false);
      return;
    }

    try {
      // Admin/GOD usa rota de instrutor, que vincula ao adminPai
      await api.post("/auth/instrutor", {
        nome,
        email,
        telefone,
        senha: senhaGerada,
      });

      alert("Instrutor criado com sucesso!");
      onUserAdded();
      onClose?.();

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.msg || "Erro ao criar instrutor.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Cadastrar Novo Instrutor</h2>
        
        {user?.role !== "god" && (
          <p className="info-text">
            O instrutor será vinculado à sua conta e terá acesso limitado ao sistema.
          </p>
        )}
        
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>

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
            <input type="text" value={gerarSenha()} disabled />
            <small>A senha será enviada para o instrutor.</small>
          </div>

          <button 
            type="submit" 
            className="btn-save-user"
            disabled={submitting}
          >
            {submitting ? "Criando..." : "Salvar Instrutor"}
          </button>
        </form>
      </div>
    </div>
  );
}
