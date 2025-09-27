import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoonsForm } from './moons-form';

describe('MoonsForm', () => {
  let component: MoonsForm;
  let fixture: ComponentFixture<MoonsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoonsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoonsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
