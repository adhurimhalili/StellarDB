export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
  errors?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  userId?: string;
  validationErrors?: ValidationError[];
}
