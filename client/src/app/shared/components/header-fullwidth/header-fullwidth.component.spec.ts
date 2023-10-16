import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFullWidthComponent } from './header-fullWidth.component';

describe('HeaderFullWidthComponent', () => {
  let component: HeaderFullWidthComponent;
  let fixture: ComponentFixture<HeaderFullWidthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderFullWidthComponent],
    });
    fixture = TestBed.createComponent(HeaderFullWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
