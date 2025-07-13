import { User } from './../core/models/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { JwtService } from './../core/services/jwt.service';
import { AuthService } from './../core/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  authForm!: FormGroup;
  title = '';
  resultLoadding = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private jetService: JwtService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  get f() {
    return this.authForm.controls;
  }

  ngOnInit(): void {
    this.createForm();
    this.title = this.router.url === '/login' ? 'Login' : 'Signup';
  }

  googleAuthHanler() {
    this.authService.googleAuth().subscribe(
      (data) => {
        console.log('data :>> ', data);
      },
      (err) => this.errorHandler(err, 'Opps, somthing went worng')
    );
  }

  onSubmit() {
    if (this.title === 'Signup') {
      this.resultLoadding = true;
      this.authService.signup(this.authForm.value).subscribe(
        (data) => {
          this.router.navigate(['/login']);
          this._snackBar.open('Signup Successfully!', 'Success', {
            duration: 2000,
          });
        },
        (err) => this.errorHandler(err, 'Opps, something went worng'),
        () => (this.resultLoadding = false)
      );
    } else {
      let {email, password} = this.authForm.value;
      let user: User = {email, password}
      this.authService.login(user).subscribe(
        (data) => {
          this.resultLoadding = true;
          this.jetService.setToken(data.token);
          this.router.navigate(['/dashbord/invoices']);
        },
        (err) => this.errorHandler(err, 'Opps, something went worng'),
        () => (this.resultLoadding = false)
      );
    }
  }

  forgotPassWord(){
    this.router.navigate(['/forgot-password']);
  }

  private createForm() {
    this.authForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      name: [''],
    });
  }

  private errorHandler(error: any, message: any) {
    this.resultLoadding = false;
    console.error(error);
    this._snackBar.open(message, 'Error', {
      duration: 2000,
    });
  }
}
