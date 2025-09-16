import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesForm } from './roles-form';

describe('RolesForm', () => {
  let component: RolesForm;
  let fixture: ComponentFixture<RolesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
