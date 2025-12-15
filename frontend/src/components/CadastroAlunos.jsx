import '../styles/CadastroAlunos.css';

export default function CadastroAlunos() {
  return (
    <div className="page">
      <div className="card">
        <h1>CADASTRO</h1>
        <form>
          <div className="full-width">
            <label>Nome completo</label>
            <input type="text" />
          </div>

          <div className="grid grid-3">
            <div>
              <label>Data de Nascimento</label>
              <input type="date" />
            </div>
            <div>
              <label>CPF</label>
              <input type="text" />
            </div>
            <div>
              <label>RG</label>
              <input type="text" />
            </div>
          </div>

          <div className="grid grid-3">
            <div>
              <label>Telefone</label>
              <input type="tel" />
            </div>
            <div>
              <label>E-mail</label>
              <input type="email" />
            </div>
            <div>
              <label>Data de Cadastro</label>
              <input type="date" />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <label>Endereço</label>
              <input type="text" />
            </div>
          </div>

          <div className="full-width">
            <label>Grau de Escolaridade</label>
            <select>
              <option>Selecione</option>
              <option>Ensino Fundamental</option>
              <option>Ensino Médio</option>
              <option>Ensino Superior</option>
            </select>
          </div>

          <div className="form-group">
            <label>Curso Escolhido</label>
            <div className="checkbox-grid">
              {[
                "Manicure e Pedicure",
                "Spa dos Pés",
                "Cabeleireira Profissional",
                "Alongamento em Unhas",
                "Trancista Profissional",
                "Design em Sobrancelhas",
                "Maquiagem Profissional",
              ].map((curso) => (
                <label key={curso} className="checkbox">
                  <input type="checkbox" /> {curso}
                </label>
              ))}
            </div>
          </div>
          <button type="submit">Cadastrar Aluno</button>
        </form>
      </div>
    </div>
  );
}
