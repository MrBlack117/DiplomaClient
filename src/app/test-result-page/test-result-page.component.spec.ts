import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestResultPageComponent } from './test-result-page.component';

describe('TestResultPageComponent', () => {
  let component: TestResultPageComponent;
  let fixture: ComponentFixture<TestResultPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestResultPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestResultPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
