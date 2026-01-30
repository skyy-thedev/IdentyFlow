import { useState, useEffect } from "react";
import api from "../services/api";
import { FiCalendar, FiClock, FiUsers, FiDollarSign, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import "../styles/CadastroAlunos.css";


export default function CadastroAlunos({ showToast }) {
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    cpf: "",
    rg: "",
    telefone: "",
    email: "",
    dataCadastro: "",
    endereco: "",
    escolaridade: "",
    cursos: [],
    statusPagamento: "pendente",
    formaPagamento: "",
    turmaId: ""
  });

  const [documento, setDocumento] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursos, setCursos] = useState("");
  const [cursosInfo, setCursosInfo] = useState({}); // Info de turmas por curso
  const [loadingTurma, setLoadingTurma] = useState(false);

  useEffect(() => {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      dataCadastro: dataFormatada,
    }));
  }, []);

  /** --- Funções de identificação e máscara CPF/RG --- */
  function identificarDocumento(valor) {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length === 11) return "cpf";
    if (apenasNumeros.length === 9) return "rg";
    return null;
  }

  function aplicarMascaraDocumento(valor) {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 9) {
      // RG
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,1})$/, ".$1-$2")
        .slice(0, 12);
    } else {
      // CPF
      return apenasNumeros
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2")
        .slice(0, 14);
    }
  }

  function handleDocumentoChange(e) {
    let valor = e.target.value;
    valor = aplicarMascaraDocumento(valor);
    setDocumento(valor);

    const tipo = identificarDocumento(valor);
    setFormData((prev) => ({
      ...prev,
      cpf: tipo === "cpf" ? valor : "",
      rg: tipo === "rg" ? valor : "",
    }));
  }

  /** --- Função de máscara de telefone --- */
  function aplicarMascaraTelefone(valor) {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`;
    }
    if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  }

  function handleTelefoneChange(e) {
    const valor = aplicarMascaraTelefone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      telefone: valor,
    }));
  }

  /** --- Funções auxiliares --- */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCheckboxChange(curso) {
    const nomeCurso = curso.nome || curso;
    const novosCursos = formData.cursos.includes(nomeCurso)
      ? formData.cursos.filter((c) => c !== nomeCurso)
      : [...formData.cursos, nomeCurso];
    
    setFormData((prev) => ({
      ...prev,
      cursos: novosCursos,
    }));

    // Buscar info da turma se curso foi adicionado
    if (!formData.cursos.includes(nomeCurso)) {
      fetchProximaTurma(nomeCurso);
    }
  }

  // Buscar próxima turma disponível para um curso
  const fetchProximaTurma = async (cursoNome) => {
    try {
      setLoadingTurma(true);
      const res = await api.get(`/turmas/proxima/${encodeURIComponent(cursoNome)}`);
      setCursosInfo(prev => ({
        ...prev,
        [cursoNome]: res.data
      }));
      
      // Auto-selecionar a turma se disponível
      if (res.data?.proximaTurma?._id) {
        setFormData(prev => ({
          ...prev,
          turmaId: res.data.proximaTurma._id
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar turma:", err);
    } finally {
      setLoadingTurma(false);
    }
  };

  // Formatar valor em reais
  const formatarValor = (valor) => {
    if (!valor) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (dataStr) => {
    if (!dataStr) return "A definir";
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calcular valor total dos cursos selecionados
  const calcularValorTotal = () => {
    let total = 0;
    formData.cursos.forEach(cursoNome => {
      const info = cursosInfo[cursoNome];
      if (info?.proximaTurma?.curso?.valorTotal) {
        total += info.proximaTurma.curso.valorTotal;
      } else if (info?.sugestao?.curso?.valorTotal) {
        total += info.sugestao.curso.valorTotal;
      }
    });
    return total;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/alunos", formData);
      showToast("Aluno cadastrado com sucesso!");

      const hoje = new Date();
      const dataFormatada = hoje.toISOString().split("T")[0];

      setFormData({
        nome: "",
        dataNascimento: "",
        cpf: "",
        rg: "",
        telefone: "",
        email: "",
        dataCadastro: dataFormatada,
        endereco: "",
        escolaridade: "",
        cursos: [],
        statusPagamento: "pendente",
        formaPagamento: "",
        turmaId: ""
      });
      setDocumento("");
      setCursosInfo({});
      console.log(formData);
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar aluno");
    }
  }

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await api.get("/cursos");
        setCursos(res.data.cursos || []);
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


  return (
    <div className="page">
      <div className="card">
        <h1>CADASTRO DE NOVO ALUNO</h1>

        <form className="form" onSubmit={handleSubmit}>
          {/* 1ª linha - Nome, Telefone e Data de Nascimento */}
          <div className="grid grid-3">
            <div>
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                placeholder="Digite o nome completo"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="(XX) XXXXX-XXXX"
                maxLength="15"
              />
            </div>

            <div>
              <label htmlFor="dataNascimento">Data de Nascimento</label>
              <input
                id="dataNascimento"
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 2ª linha - E-mail, CPF/RG e Data de Cadastro */}
          <div className="grid grid-3">
            <div>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="documento">CPF ou RG</label>
              <input
                id="documento"
                name="documento"
                value={documento}
                onChange={handleDocumentoChange}
                placeholder="Digite o CPF ou RG"
                maxLength="14"
              />
            </div>

            <div>
              <label htmlFor="dataCadastro">Data de Cadastro</label>
              <input
                id="dataCadastro"
                type="date"
                name="dataCadastro"
                value={formData.dataCadastro}
                disabled
              />
            </div>
          </div>

          {/* 3ª linha - Endereço e Escolaridade */}
          <div className="grid grid-2">
            <div>
              <label htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="escolaridade">Grau de Escolaridade</label>
              <select
                id="escolaridade"
                name="escolaridade"
                value={formData.escolaridade}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                <option>Ensino Fundamental</option>
                <option>Ensino Médio</option>
                <option>Ensino Superior</option>
              </select>
            </div>
          </div>

          {/* 4ª linha - Cursos */}
          <div className="form-group">
            <p>Curso(s) Escolhido(s):</p>
          <div className="checkbox-grid">
            {loading ? (
              <p>Carregando cursos...</p>
            ) : erro ? (
              <p className="erro">{erro}</p>
            ) : cursos.length > 0 ? (
              cursos.map((curso) => {
                const nomeCurso = curso.nome || curso;
                const isSelected = formData.cursos.includes(nomeCurso);
                
                return (
                  <label key={nomeCurso} className={`checkbox ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      className="checkbox-round"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(curso)}
                    />
                    <div className="curso-checkbox-content">
                      <p className="curso-nome">{nomeCurso}</p>
                      {curso.valorTotal && (
                        <span className="curso-valor">{formatarValor(curso.valorTotal)}</span>
                      )}
                    </div>
                  </label>
                );
              })
            ) : (
              <p>Nenhum curso disponível.</p>
            )}
          </div>
        </div>

          {/* Info das Turmas Selecionadas */}
          {formData.cursos.length > 0 && (
            <div className="turmas-info-section">
              <p className="section-label">📅 Informações das Turmas:</p>
              <div className="turmas-info-grid">
                {formData.cursos.map(cursoNome => {
                  const info = cursosInfo[cursoNome];
                  const turma = info?.proximaTurma;
                  const sugestao = info?.sugestao;
                  
                  return (
                    <div key={cursoNome} className="turma-info-card">
                      <div className="turma-info-header">
                        <h4>{cursoNome}</h4>
                        {turma ? (
                          <span className="turma-status disponivel">
                            <FiCheckCircle /> Turma Disponível
                          </span>
                        ) : (
                          <span className="turma-status aguardando">
                            <FiAlertCircle /> Aguardando Turma
                          </span>
                        )}
                      </div>
                      
                      {turma ? (
                        <div className="turma-info-body">
                          <div className="turma-info-item">
                            <FiCalendar />
                            <span>Início: {formatarData(turma.dataInicio)}</span>
                          </div>
                          <div className="turma-info-item">
                            <FiClock />
                            <span>Horário: {turma.horario || "A definir"}</span>
                          </div>
                          <div className="turma-info-item">
                            <FiUsers />
                            <span>Vagas: {turma.vagasDisponiveis}/{turma.capacidade}</span>
                          </div>
                          <div className="turma-info-item valor">
                            <FiDollarSign />
                            <span>{formatarValor(turma.curso?.valorTotal)}</span>
                          </div>
                        </div>
                      ) : sugestao ? (
                        <div className="turma-info-body">
                          <p className="sugestao-msg">{sugestao.mensagem}</p>
                          <div className="turma-info-item valor">
                            <FiDollarSign />
                            <span>{formatarValor(sugestao.curso?.valorTotal)}</span>
                          </div>
                        </div>
                      ) : loadingTurma ? (
                        <p className="loading-turma">Buscando turma...</p>
                      ) : (
                        <p className="sem-info">Informações indisponíveis</p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Total e Status de Pagamento */}
              <div className="pagamento-section">
                <div className="valor-total">
                  <span className="label">Valor Total:</span>
                  <span className="valor">{formatarValor(calcularValorTotal())}</span>
                </div>
                
                <div className="pagamento-grid">
                  <div className="form-field">
                    <label htmlFor="statusPagamento">Status do Pagamento</label>
                    <select
                      id="statusPagamento"
                      name="statusPagamento"
                      value={formData.statusPagamento}
                      onChange={handleChange}
                    >
                      <option value="pendente">⏳ Pendente</option>
                      <option value="pago">✅ Pago</option>
                      <option value="parcial">🔄 Parcialmente Pago</option>
                      <option value="isento">🎁 Isento</option>
                    </select>
                  </div>
                  
                  {formData.statusPagamento === "pago" && (
                    <div className="form-field">
                      <label htmlFor="formaPagamento">Forma de Pagamento</label>
                      <select
                        id="formaPagamento"
                        name="formaPagamento"
                        value={formData.formaPagamento}
                        onChange={handleChange}
                      >
                        <option value="">Selecione</option>
                        <option value="pix">💠 PIX</option>
                        <option value="credito">💳 Cartão de Crédito</option>
                        <option value="debito">💳 Cartão de Débito</option>
                        <option value="dinheiro">💵 Dinheiro</option>
                        <option value="boleto">📄 Boleto</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="cadastro-btn">
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </div>
  );
}
