import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordStrengthInput } from './password-strength-input';

describe('PasswordStrengthInput', () => {
  let component: PasswordStrengthInput;
  let fixture: ComponentFixture<PasswordStrengthInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
