export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
}
