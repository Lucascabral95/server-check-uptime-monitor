import "./ErrorState.scss"

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  title = "Ocurrió un error",
  description = "No se pudo cargar la información. Intentá nuevamente.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="state-wrapper error">
      <h3>{title}</h3>
      <p>{description}</p>

      {onRetry && (
        <button onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorState;
