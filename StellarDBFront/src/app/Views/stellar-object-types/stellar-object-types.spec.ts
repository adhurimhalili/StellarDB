import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StellarObjectTypes } from './stellar-object-types';

describe('StellarObjectTypes', () => {
  let component: StellarObjectTypes;
  let fixture: ComponentFixture<StellarObjectTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StellarObjectTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StellarObjectTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
