import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/AddUser.css";

export default function AddUser({ onClose, onUserAdded }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissoes, setProfissoes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // Carrega cursos do banco para o campo PROFISSÃO
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await api.get("/cursos");
        setCursos(res.data.cursos || []);
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
      } finally {
        setLoadingCursos(false);
      }
    };

    fetchCursos();
  }, []);

  // Gera senha automática
  const gerarSenha = () => {
    if (!nome || profissoes.length === 0 || telefone.length < 4) return "";

    const nome4 = nome.slice(0, 4).toLowerCase();
    const prof4 = profissoes[0].slice(0, 4).toLowerCase(); // usa o primeiro curso escolhido
    const tel4 = telefone.slice(-4);

    return nome4 + prof4 + tel4;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const senhaGerada = gerarSenha();

    try {
      await api.post("/auth/register", {
        nome,
        email,
        telefone,
        profissoes,
        senha: senhaGerada,
      });

      alert("Usuário criado com sucesso!");
      onUserAdded();
      onClose?.();

    } catch (error) {
      console.error(error);
      alert("Erro ao criar usuário.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Cadastrar Novo Usuário</h2>

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
            <label>Profissão (Cursos)</label>

            {loadingCursos ? (
              <p>Carregando cursos...</p>
            ) : (
              <select
                multiple
                value={profissoes}
                onChange={(e) =>
                  setProfissoes(
                    [...e.target.selectedOptions].map((o) => o.value)
                  )
                }
              >
                {cursos.map((curso) => (
                  <option key={curso._id} value={curso.nome}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            )}

            <small>Segure CTRL para selecionar mais de um curso.</small>
          </div>

          <div className="form-group">
            <label>Senha gerada automaticamente</label>
            <input type="text" value={gerarSenha()} disabled />
          </div>

          <button type="submit" className="btn-save-user">Salvar Usuário</button>
        </form>
      </div>
    </div>
  );
}
