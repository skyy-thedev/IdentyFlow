import { useEffect, useState } from "react";
import axios from "axios";
import AddCurso from "./AddCurso";
import "../styles/Cursos.css";

export default function CursosLista({ showToast }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [showAddCurso, setShowAddCurso] = useState(false);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/cursos", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCursos(res.data.cursos);
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar os cursos.");
        showToast("Erro ao carregar cursos.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [showToast]);

  if (loading) return <p className="loading">Carregando cursos...</p>;
  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div className="cursos-container">
      <h2>Cursos Cadastrados</h2>
      <p>Total: <strong>{cursos.length}</strong></p>

      <button className="btn-add-curso" onClick={() => setShowAddCurso(true)}>
        + Adicionar Novo Curso
      </button>

      {showAddCurso && (
        <div className="modal-overlay" onClick={() => setShowAddCurso(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddCurso(false)}>×</button>

            <AddCurso
              onCursoAdded={async () => {
                const token = localStorage.getItem("token");
                try {
                  const res = await axios.get("http://localhost:5000/cursos", {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setCursos(res.data.cursos);
                  setShowAddCurso(false);
                  showToast("Curso criado com sucesso!", "success");
                } catch (err) {
                  console.error(err);
                  showToast("Erro ao carregar cursos.", "error");
                }
              }}
              onClose={() => setShowAddCurso(false)}
            />
          </div>
        </div>
      )}

      <table className="cursos-table">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Carga Horária</th>
            <th>Dias</th>
            <th>Valor (R$)</th>
            <th>Mín. Vagas</th>
            <th>Máx. Vagas</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {cursos.map((c) => (
            <tr key={c._id}>
              <td>{c.nome}</td>
              <td>{c.cargaHoraria}h</td>
              <td>{c.dias}</td>
              <td>{c.valorTotal.toFixed(2)}</td>
              <td>{c.minVagas}</td>
              <td>{c.maxVagas}</td>
              <td>
                <button className="btn-edit">Editar</button>
                <button
                  className="btn-delete"
                  onClick={() => showToast("Função ainda não implementada", "warning")}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
