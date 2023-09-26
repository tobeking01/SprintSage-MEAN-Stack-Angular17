import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFullwidthComponent } from './header-fullwidth.component';

describe('HeaderFullwidthComponent', () => {
  let component: HeaderFullwidthComponent;
  let fixture: ComponentFixture<HeaderFullwidthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderFullwidthComponent]
    });
    fixture = TestBed.createComponent(HeaderFullwidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
