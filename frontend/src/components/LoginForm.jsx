import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Modal from "./Modal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // ✔ AUTH CONTEXT IMPORTANTE

  const [, setLocation] = useLocation();

  const [modal, setModal] = useState(null);

  const showModal = (type, title, message) => {
    setModal({ type, title, message });
  };

  const closeModal = () => setModal(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    // VALIDAÇÃO FRONTEND — obrigatória
    if (!email.trim()) {
      return showModal("warning", "Campo obrigatório", "Digite seu e-mail para continuar.");
    }

    if (!senha.trim()) {
      return showModal("warning", "Campo obrigatório", "Digite sua senha para continuar.");
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        senha
      });

      const { token, user } = response.data;

      console.log(token + " | " + user.role + " | " + user.nome + " entrou no sistema com sucesso");

      // ✔ SALVA USUÁRIO E TOKEN NO AUTH CONTEXT (correto)
      login(user, token);

      setLoading(false);
      setLocation("/dashboard");

    } catch (err) {
      setLoading(false);

      if (!err.response) {
        return showModal("error", "Erro de conexão", "Não foi possível conectar ao servidor.");
      }

      const backendMsg = err.response.data.msg;

      if (backendMsg === "Usuário não encontrado.") {
        return showModal("error", "Usuário não encontrado", "Verifique o e-mail informado.");
      }

      if (backendMsg === "Senha incorreta.") {
        return showModal("error", "Senha incorreta", "A senha digitada não corresponde.");
      }

      return showModal("error", "Erro inesperado", backendMsg || "Ocorreu um erro inesperado.");
    }
  };

  return (
    <>
      {modal && (
        <Modal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <div className="login">
        <h1>Acesse sua conta</h1>
        <p>Entre com suas credenciais para acessar o sistema</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="emailInput">E-mail</label>
            <input
              id="emailInput"
              type="email"
              placeholder="Digite seu e-mail"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passInput">Senha</label>
            <input
              id="passInput"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button id="send-btn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-links">
          <a href="/forget">Esqueceu a senha?</a>
        </div>
      </div>
    </>
  );
}
