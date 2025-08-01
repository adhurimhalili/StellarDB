import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Star } from './star';

describe('Star', () => {
  let component: Star;
  let fixture: ComponentFixture<Star>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Star]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Star);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
