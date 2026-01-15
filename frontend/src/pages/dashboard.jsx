import { useState } from "react";
import NavBar from '../components/NavBar.jsx';
import DashHeader from '../components/dashHeader.jsx';
import DashboardHome from "../components/DashboardHome";
import CadastroAlunos from "../components/CadastroAlunos";
import Historico from "../components/Historico";
import Analytics from "../components/Analytics";
import ListaUsuarios from "../components/ListaUsuarios";
import CursosLista from "../components/CursosLista";
import Turmas from "../components/Turmas.jsx";
import '../styles/dashboard.css';

function Dashboard({ showToast }) {
  const [currentSection, setCurrentSection] = useState("dashboard");

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardHome showToast={showToast} />;
      case "cadastro":
        return <CadastroAlunos showToast={showToast} />;
      case "turmas":
        return <Turmas showToast={showToast} />;
      case "historico":
        return <Historico showToast={showToast} />;
      case "analytics":
        return <Analytics showToast={showToast} />;
      case "cursos":
        return <CursosLista showToast={showToast} />;
      case "users":
        return <ListaUsuarios showToast={showToast} />;
      default:
        return <DashboardHome showToast={showToast} />;
    }
  };

  return (
    <div className="  ">
      <NavBar onSelect={setCurrentSection} />

      <div className="exibeContent">
        <DashHeader />

        {/* exibição da seção atual */}
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;
