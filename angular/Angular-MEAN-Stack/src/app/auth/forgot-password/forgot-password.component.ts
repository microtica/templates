import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  resultsLoading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  onSubmit() {
    this.resultsLoading = true;
    this.authService.forgotPassword(this.form.value).subscribe(
      (data) => {
        // console.log(data);
        this._snackBar.open(data.message, 'success', {duration: 2000})
      },
      (err) => {
        this.errorHandler(err, 'Could not send the mail');
      },
      () => {
        this.resultsLoading = false;
      }
    );
  }

  private initForm() {
    this.form = this.fb.group({
      email: ['', Validators.required],
    });
  }

  private errorHandler(error: any, message: string) {
    this.resultsLoading = false;
    console.error(error);
    this._snackBar.open(message, 'Error', {
      duration: 2000,
    });
  }
}
