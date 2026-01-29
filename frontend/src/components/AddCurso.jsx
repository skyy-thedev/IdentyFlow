import { useState } from "react";
import api from "../services/api";

export default function AddCurso({ onCursoAdded }) {
  const [nome, setNome] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [dias, setDias] = useState("");
  const [valor, setValor] = useState("");          // <-- corrigido
  const [minVagas, setMinVagas] = useState("");
  const [maxVagas, setMaxVagas] = useState("");

  const diasFixos = [2, 4, 6, 8, 10, 12, 14];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/cursos", {
        nome,
        cargaHoraria: Number(cargaHoraria),
        dias: Number(dias),
        valorTotal: Number(valor),
        minVagas: Number(minVagas),
        maxVagas: Number(maxVagas),
      });

      onCursoAdded();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="addcurso-container">
      <h2>Novo Curso</h2>

      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Nome do curso</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Carga Horária (horas)</label>
          <input type="number" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Dias de aula</label>
          <select value={dias} onChange={(e) => setDias(e.target.value)} required>
            <option value="">Selecione...</option>
            {diasFixos.map((d) => (
              <option key={d} value={d}>{d} dias</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Valor total (à vista)</label>
          <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Mínimo de vagas</label>
          <input type="number" value={minVagas} onChange={(e) => setMinVagas(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Máximo de vagas</label>
          <input type="number" value={maxVagas} onChange={(e) => setMaxVagas(e.target.value)} required />
        </div>

        <button type="submit" className="btn-save-curso">Salvar Curso</button>
      </form>
    </div>
  );
}
