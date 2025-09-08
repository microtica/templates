import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './../../../core/services/auth.service';
import { Router } from '@angular/router';
import { JwtService } from './../../../core/services/jwt.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(
    private jwtService: JwtService,
    private router: Router,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  // logOut() {
  //   this.authService.logout().subscribe(
  //     (data) => { console.log(data) },
  //     (err) => this.errorHandler(err, 'Somthing went wrong'),
  //     () => {
  //       this.jwtService.destoryToken();
  //       this.router.navigate(['/login']);
  //     }
  //   );
  // }

  logOut() {
    this.jwtService.destoryToken();
    this.router.navigate(['/login']);
  }

  private errorHandler(error: any, message: string) {
    console.error(error);
    this._snackBar.open(message, 'Error', { duration: 2000 });
  }
}
