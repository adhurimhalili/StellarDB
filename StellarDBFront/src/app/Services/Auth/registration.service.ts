import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GlobalConfig } from '../../global-config';
import { RegisterRequest, RegisterResponse, RegistrationResult, ValidationError } from '../../Core/Models/Auth/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private readonly registrationUrl = `${GlobalConfig.apiUrl}/Auth/register`;

  constructor(private http: HttpClient) { }

  /**
   * Registers a new user
   * @param registerData The registration data
   * @returns Observable<RegistrationResult>
   */
  register(registerData: RegisterRequest): Observable<RegistrationResult> {
    // Transform the data to match the backend CreateUserViewModel structure
    const payload = {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      userName: registerData.userName,
      email: registerData.email,
      phoneNumber: registerData.phoneNumber,
      dateOfBirth: this.formatDateForBackend(registerData.dateOfBirth),
      password: registerData.password
    };

    return this.http.post<any>(this.registrationUrl, payload)
      .pipe(
        map((response: any) => {
          return {
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            userId: response.id || response.userId
          } as RegistrationResult;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleRegistrationError(error));
        })
      );
  }

  /**
   * Validates email availability
   * @param email The email to check
   * @returns Observable<boolean>
   */
  checkEmailAvailability(email: string): boolean { // TO DO
    return true;
  }

  /**
   * Validates username availability
   * @param userName The username to check
   * @returns Observable<boolean>
   */
  checkUsernameAvailability(userName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.registrationUrl}/check-username`, {
      params: { userName }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error checking username availability:', error);
        return throwError(() => false);
      })
    );
  }

  /**
   * Validates password strength
   * @param password The password to validate
   * @returns Object with validation results
   */
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score++;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score++;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score++;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score++;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score++;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) {
      strength = 'strong';
    } else if (score >= 2) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  /**
   * Validates the registration form data
   * @param formData The form data to validate
   * @returns Array of validation errors
   */
  validateRegistrationData(formData: RegisterRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // First Name validation
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.push({
        field: 'firstName',
        message: 'First name must be at least 2 characters long'
      });
    }

    // Last Name validation
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.push({
        field: 'lastName',
        message: 'Last name must be at least 2 characters long'
      });
    }

    // Username validation
    if (!formData.userName || formData.userName.trim().length < 3) {
      errors.push({
        field: 'userName',
        message: 'Username must be at least 3 characters long'
      });
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      errors.push({
        field: 'userName',
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address'
      });
    }

    // Phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.push({
        field: 'phoneNumber',
        message: 'Please enter a valid phone number'
      });
    }

    // Birth date validation
    if (!formData.dateOfBirth) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Birth date is required'
      });
    } else {
      const dateOfBirth = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dateOfBirth.getFullYear();

      if (age < 13) {
        errors.push({
          field: 'dateOfBirth',
          message: 'You must be at least 13 years old to register'
        });
      }

      if (dateOfBirth > today) {
        errors.push({
          field: 'dateOfBirth',
          message: 'Birth date cannot be in the future'
        });
      }
    }

    // Password validation
    const passwordValidation = this.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(error => {
        errors.push({
          field: 'password',
          message: error
        });
      });
    }

    return errors;
  }

  /**
   * Formats date for backend consumption
   * @param dateString The date string to format
   * @returns Formatted date string
   */
  private formatDateForBackend(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  /**
   * Handles registration errors from the backend
   * @param error The HTTP error response
   * @returns RegistrationResult with error details
   */
  private handleRegistrationError(error: HttpErrorResponse): RegistrationResult {
    let message = 'Registration failed. Please try again.';
    let validationErrors: ValidationError[] = [];

    if (error.status === 400) {
      // Bad Request - validation errors
      if (error.error && error.error.errors) {
        // ASP.NET Core ModelState errors
        Object.keys(error.error.errors).forEach(field => {
          error.error.errors[field].forEach((errorMessage: string) => {
            validationErrors.push({
              field: field.toLowerCase(),
              message: errorMessage
            });
          });
        });
        message = 'Please correct the validation errors and try again.';
      } else if (typeof error.error === 'string') {
        message = error.error;
      }
    } else if (error.status === 409) {
      // Conflict - user already exists
      message = 'A user with this email or username already exists.';
    } else if (error.status === 500) {
      // Internal Server Error
      message = 'Server error occurred. Please try again later.';
    } else if (error.status === 0) {
      // Network error
      message = 'Network error. Please check your connection and try again.';
    }

    return {
      success: false,
      message,
      validationErrors
    };
  }
}
