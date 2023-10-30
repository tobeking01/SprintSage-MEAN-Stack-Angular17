// confirmation-dialog.component.ts
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>Confirm Action</h2>
      <mat-dialog-content>Are you sure you want to proceed?</mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button color="warn" (click)="onCancel()">
          Cancel
        </button>
        <button mat-raised-button color="accent" (click)="onConfirm()">
          OK
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
