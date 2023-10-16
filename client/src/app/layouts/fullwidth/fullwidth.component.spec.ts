import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullWidthComponent } from './fullWidth.component';

describe('FullWidthComponent', () => {
  let component: FullWidthComponent;
  let fixture: ComponentFixture<FullWidthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullWidthComponent],
    });
    fixture = TestBed.createComponent(FullWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
