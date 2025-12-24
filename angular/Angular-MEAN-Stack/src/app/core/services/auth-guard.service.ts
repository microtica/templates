import { AuthService } from './auth.service';
// canActivate guard for user validation router/

import { JwtService } from './jwt.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(
    private jwtService: JwtService,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const isAuth = this.jwtService.isAuth();
    if (isAuth) {
      return of(true);
    }

    const token = route.queryParamMap.get('token');
    if (token) {
      // return this.authService.authenticate(token).subscribe(authenticated => {
      //   if (authenticated === true) {
      //     this.jwtService.setToken(token);
      //     return true;
      //   }
      //   this.router.navigate(['/login']);
      //   return of(false);
      // });

      return this.authService.isAuthenticated(token).pipe(
        map((authenticated) => {
          if (authenticated === true) {
            this.jwtService.setToken(token);
            this.router.navigate(['/dashboard/invoices']);
            return true;
          }
          this.router.navigate(['/login']);
          return false;
        }),
        catchError(() => {
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    } 
    else {
      this.router.navigate(['/login']);
      return of(false);
    }
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(route, state);
  }
}
