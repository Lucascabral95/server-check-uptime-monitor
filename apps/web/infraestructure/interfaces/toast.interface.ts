export interface ToastInterface {
    message: string;
    type: "success" | "error" | "warning" | "info";
    visible: boolean;
}