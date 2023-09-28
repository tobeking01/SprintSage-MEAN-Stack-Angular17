import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorDashboardComponent } from './moderator-dashboard.component';

describe('ModeratorDashboardComponent', () => {
  let component: ModeratorDashboardComponent;
  let fixture: ComponentFixture<ModeratorDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModeratorDashboardComponent]
    });
    fixture = TestBed.createComponent(ModeratorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
