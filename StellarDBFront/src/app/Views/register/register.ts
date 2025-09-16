import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { PasswordStrengthInputComponent } from '../../Shared/password-strength-input/password-strength-input';
import { ValidationError, RegisterRequest } from '../../Core/Models/Auth/registration.model';
import { RegistrationService } from '../../Services/Auth/registration.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatIconModule, MatDatepickerModule, PasswordStrengthInputComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = "";
  loading: boolean = false;
  returnUrl!: string;
  strongPassword = false;
  validationErrors: ValidationError[] = [];
  successMessage: string = "";
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private registrationService: RegistrationService,
    private cdr: ChangeDetectorRef) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/Login";
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      this.cdr.detectChanges(); // Trigger change detection
      return;
    }

    // Validate strong password requirement
    if (!this.strongPassword) {
      this.errorMessage = "Please enter a strong password";
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    this.successMessage = "";
    this.validationErrors = [];
    this.cdr.detectChanges(); // Update UI

    try {
      const registerData: RegisterRequest = {
        firstName: this.registerForm.value.firstName?.trim(),
        lastName: this.registerForm.value.lastName?.trim(),
        userName: this.registerForm.value.userName?.trim(),
        email: this.registerForm.value.email?.trim().toLowerCase(),
        phoneNumber: this.registerForm.value.phoneNumber?.trim(),
        dateOfBirth: this.registerForm.value.dateOfBirth,
        password: this.registerForm.value.password
      };

      // Client-side validation
      const clientValidationErrors = this.registrationService.validateRegistrationData(registerData);
      if (clientValidationErrors.length > 0) {
        this.validationErrors = clientValidationErrors;
        var test = this.validationErrors.length > 0
        this.errorMessage = "Please correct the errors below:";
        this.loading = false;
        this.cdr.detectChanges(); 
        return;
      }

      // Proceed with registration
      const result = await firstValueFrom(
        this.registrationService.register(registerData)
      );

      if (result.success) {
        this.successMessage = result.message;
        this.cdr.detectChanges();
        // Redirect to login after successful registration
        setTimeout(() => {
          this.router.navigate([this.returnUrl], {
            queryParams: { message: 'Registration successful. Please log in.' }
          });
        }, 2000);
      } else {
        this.errorMessage = result.message;
        this.validationErrors = result.validationErrors || [];
        this.cdr.detectChanges();
      }

      this.loading = false;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Register error:', error);
      this.errorMessage = error.message || 'Registration failed. Please try again.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
    this.cdr.detectChanges();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
