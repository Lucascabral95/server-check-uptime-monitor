export interface ConfirmEmailCredentials {
  email: string;
  code: string;
}

export interface ConfirmEmailResponse {
  isComplete: boolean;
}

export interface ResendCodeResponse {
  destination: string;
  deliveryMedium: string;
  attribute: string;
}
