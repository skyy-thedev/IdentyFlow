import { useEffect, useState } from "react";
import api from "../services/api";
import { useRole } from "./RoleGuard";
import "../styles/historicoComponent.css";

export default function Historico({ showToast }) {
  const { isInstrutor } = useRole();
  
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");

  const cursosDisponiveis = [...new Set(
  alunos.flatMap(a => Array.isArray(a.cursos) ? a.cursos : [a.cursos])
  )];


  // Busca os alunos cadastrados no servidor
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        // A rota /alunos já filtra automaticamente por role no backend
        const res = await api.get("/alunos");
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

  const alunosFiltrados = alunos.filter((aluno) => {
  const nomeMatch = aluno.nome
    .toLowerCase()
    .includes(filtroNome.toLowerCase());

  const dataMatch = filtroData
    ? new Date(aluno.dataCadastro).toISOString().split("T")[0] === filtroData
    : true;

  const cursoMatch = filtroCurso
    ? (Array.isArray(aluno.cursos)
        ? aluno.cursos.includes(filtroCurso)
        : aluno.cursos === filtroCurso)
    : true;

  return nomeMatch && dataMatch && cursoMatch;
  });

  return (
    <div className="historico-page">
      <h1>📋 {isInstrutor ? "Meus Alunos" : "Histórico de Cadastros"}</h1>
      
      <div className="historico-container">

        <div className="filtro-container">
  <input
    type="text"
    placeholder="Pesquisar nome..."
    value={filtroNome}
    onChange={(e) => setFiltroNome(e.target.value)}
  />

 <input
  type="date"
  value={filtroData}
  onChange={(e) => setFiltroData(e.target.value)}
  onClick={(e) => e.target.showPicker && e.target.showPicker()}
/>

  <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
    <option value="">Todos os cursos</option>
    {cursosDisponiveis.map((c) => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
  </div>


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
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id || aluno._id}>
                    <td data-label="Nome">{aluno.nome}</td>
                    <td data-label="Telefone">{aluno.telefone}</td>
                    <td data-label="Email">{aluno.email}</td>
                    <td data-label="Curso(s)">
                      {Array.isArray(aluno.cursos)
                        ? aluno.cursos.join(", ")
                        : aluno.cursos}
                    </td>
                    <td data-label="Data">
                      {aluno.dataCadastro
                        ? new Date(aluno.dataCadastro).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td data-label="Escolaridade">{aluno.escolaridade}</td>
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
