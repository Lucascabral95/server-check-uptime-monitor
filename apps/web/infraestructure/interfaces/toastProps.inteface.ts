export interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
}