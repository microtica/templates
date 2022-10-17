import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor() {}

  setToken(token: string) {
    return window.localStorage.setItem('jwt_token', token);
  }

  getToken() {
    return window.localStorage.getItem('jwt_token');
  }

  destoryToken() {
    return window.localStorage.removeItem('jwt_token');
  }

  isAuth(): boolean{
    return !!localStorage.getItem('jwt_token')
  }
}
