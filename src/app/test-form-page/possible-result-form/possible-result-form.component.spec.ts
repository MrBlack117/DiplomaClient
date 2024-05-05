import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PossibleResultFormComponent } from './possible-result-form.component';

describe('PossibleResultFormComponent', () => {
  let component: PossibleResultFormComponent;
  let fixture: ComponentFixture<PossibleResultFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PossibleResultFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PossibleResultFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
