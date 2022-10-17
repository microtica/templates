import { Router } from '@angular/router';
// set token to header part of api when it called
import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private jwtService: JwtService, private router: Router) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    const token = this.jwtService.getToken();
    if (token) {
      const _req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
      });
      return next.handle(_req).pipe(tap(err => {
        if(err instanceof HttpResponse){
          if(err.status === 401){
            this.jwtService.destoryToken();
            this.router.navigate(['/login']);
          }
        }
      }))
    }
  }
}
