import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuscherPageComponent } from './luscher-page.component';

describe('LuscherPageComponent', () => {
  let component: LuscherPageComponent;
  let fixture: ComponentFixture<LuscherPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuscherPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LuscherPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
