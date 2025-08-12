import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalElements } from './chemical-elements';

describe('ChemicalElements', () => {
  let component: ChemicalElements;
  let fixture: ComponentFixture<ChemicalElements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChemicalElements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemicalElements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
