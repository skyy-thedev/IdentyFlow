import "../styles/Modal.css";

export default function Modal({ type = "error", title, message, onClose, children, isOpen }) {
  // Suporta tanto o antigo padrão quanto o novo com isOpen
  if (isOpen === false) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {title && <h2>{title}</h2>}
        {message && <p>{message}</p>}

        {children ? (
          <div className="modal-body">{children}</div>
        ) : (
          <button onClick={onClose} className="btn-save-user">
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
