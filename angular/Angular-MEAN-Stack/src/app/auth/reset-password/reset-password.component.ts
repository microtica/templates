import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  private token = '';
  isResultsLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.token = this.route.snapshot.params['token'];
  }

  onSubmit() {
    let { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this._snackBar.open('Both password should match', 'warning', {
        duration: 3000,
      });
      return;
    }
    this.isResultsLoading = true;
    this.authService.resetPassword({ token: this.token, password }).subscribe(
      (data) => {
        this._snackBar.open('Password updated succesfully', 'Success', {
          duration: 3000,
        });
        this.router.navigate(['/login']);
      },
      (err) => this.errorHandler(err, 'Password not update'),
      () => (this.isResultsLoading = false)
    );
  }

  private initForm() {
    this.form = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  private errorHandler(error: any, message: string) {
    this.isResultsLoading = false;
    console.error(error);
    this._snackBar.open(message, 'Error', {
      duration: 2000,
    });
  }
}
