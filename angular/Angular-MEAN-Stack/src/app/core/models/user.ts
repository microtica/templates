export class User {
  _id?: string;
  email!: string;
  password!: string;
  name?: string
}

export interface LoginRes {
  success: boolean;
  token: string;
}

export interface SignupRes {
  success: boolean;
  message: string;
}

export interface LogoutRes {
  success: true;
}
