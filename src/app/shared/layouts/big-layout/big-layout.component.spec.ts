import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigLayoutComponent } from './big-layout.component';

describe('BigLayoutComponent', () => {
  let component: BigLayoutComponent;
  let fixture: ComponentFixture<BigLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BigLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
