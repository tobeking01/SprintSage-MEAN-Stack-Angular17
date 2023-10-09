import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProjectFull } from 'src/app/services/model/project.model';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent {
  @Input() selectedProject: ProjectFull | null = null;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
