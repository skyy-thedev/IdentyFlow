import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import logoIdentyFlow from '../assets/pngs/Sublogo IdentifyFlow Branco.png';
import LoginForm from "../components/LoginForm";
import '../styles/home.css';

function Inicio() {
  const [stars, setStars] = useState([]);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const newStars = Array.from({ length: 60 }).map(() => ({
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2 + "s",
    }));
    setStars(newStars);
  }, []);

  return (  
    <div className="home-page">
      {/* Fundo de estrelas */}
      <div className="stars">
        {stars.map((star, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size + "px",
              height: star.size + "px",
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className='logo-container'>
        <a href="https://www.identyflow.com.br">
          <img src={logoIdentyFlow} alt="IdentyFlow Logo" />
        </a>
      </div>

      <LoginForm />

      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.8rem', 
        marginTop: '32px',
        position: 'relative',
        zIndex: 10
      }}>
        SkyZ Design © 2025 All rights reserved
      </p>
    </div>
  );
}

export default Inicio;
