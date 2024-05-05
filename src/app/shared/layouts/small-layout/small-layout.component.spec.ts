import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallLayoutComponent } from './small-layout.component';

describe('SmallLayoutComponent', () => {
  let component: SmallLayoutComponent;
  let fixture: ComponentFixture<SmallLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmallLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
