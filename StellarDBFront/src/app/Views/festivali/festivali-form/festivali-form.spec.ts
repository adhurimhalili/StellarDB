import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FestivaliForm } from './festivali-form';

describe('FestivaliForm', () => {
  let component: FestivaliForm;
  let fixture: ComponentFixture<FestivaliForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FestivaliForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FestivaliForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
