import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/turmas.css"; // você pode copiar o estilo base do CadastroAlunos e ajustar

export default function Turmas({ showToast }) {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Busca os alunos cadastrados no servidor
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/alunos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // O backend deve retornar um array de alunos
        setAlunos(res.data.alunos || res.data);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        setErro("Não foi possível carregar o histórico de alunos.");
        if (showToast) showToast("Erro ao carregar histórico.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [showToast]);

  return (
    <div className="page">
      <div className="card">
        <h1>HISTÓRICO DE ALUNOS CADASTRADOS</h1>

        {loading ? (
          <p>Carregando dados...</p>
        ) : erro ? (
          <p className="erro">{erro}</p>
        ) : alunos.length === 0 ? (
          <p>Nenhum aluno cadastrado até o momento.</p>
        ) : (
          <div className="table-container">
            <table className="alunos-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Curso(s)</th>
                  <th>Data de Cadastro</th>
                  <th>Escolaridade</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id || aluno._id}>
                    <td>{aluno.nome}</td>
                    <td>{aluno.telefone}</td>
                    <td>{aluno.email}</td>
                    <td>
                      {Array.isArray(aluno.cursos)
                        ? aluno.cursos.join(", ")
                        : aluno.cursos}
                    </td>
                    <td>
                      {aluno.dataCadastro
                        ? new Date(aluno.dataCadastro).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td>{aluno.escolaridade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
