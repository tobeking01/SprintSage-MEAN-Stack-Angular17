import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTicketComponent } from './project-ticket.component';

describe('ProjectTicketComponent', () => {
  let component: ProjectTicketComponent;
  let fixture: ComponentFixture<ProjectTicketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectTicketComponent],
    });
    fixture = TestBed.createComponent(ProjectTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
