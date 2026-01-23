import "./Toast.scss";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
}

const Toast = ({ message, type, visible }: ToastProps) => {
  if (!visible) return null;

  return (
    <div className="toast">
      <div className={`toast-content ${type}`}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Toast;