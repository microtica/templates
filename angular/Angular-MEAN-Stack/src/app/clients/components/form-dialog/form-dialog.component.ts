import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from './../../services/client.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Client } from '../../models/client';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
})
export class FormDialogComponent implements OnInit {
  clientForm!: FormGroup;
  title = 'New Client';
  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  get f() {
    return this.clientForm.controls;
  }

  ngOnInit(): void {
    this.initClientForm();
    if(this.data && this.data.clientId){
      this.setClientToForm(this.data.clientId)
    }   
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private setClientToForm(clientId: any){
    this.title = 'Edit Client'
    this.clientService.getClient(clientId).subscribe(client => {
      this.clientForm.patchValue(client);
    }, err => this.errorHandler(err, "Fail to load client"));
  }

  // client form and validation
  private initClientForm() {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private errorHandler(error: any, message: string) {
    console.error(error);
    this._snackBar.open(message, 'Error', {
      duration: 2000,
    });
  }
}
