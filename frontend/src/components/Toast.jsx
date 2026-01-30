import { useEffect } from "react";
import "../styles/Toast.css";

export default function Toast({ message, type, onClose, show }) {
  useEffect(() => {
    if (onClose && show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, show]);

  // Se show for passado explicitamente, respeitar
  if (show === false) return null;
  
  // Se não tem message, não renderiza
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
    </div>
  );
}
