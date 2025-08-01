import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeToggleSwitch } from './theme-toggle-switch';

describe('ThemeToggleSwitch', () => {
  let component: ThemeToggleSwitch;
  let fixture: ComponentFixture<ThemeToggleSwitch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeToggleSwitch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeToggleSwitch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
