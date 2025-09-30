import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventiForm } from './eventi-form';

describe('EventiForm', () => {
  let component: EventiForm;
  let fixture: ComponentFixture<EventiForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventiForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventiForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
