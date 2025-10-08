export interface User {
  id: number | null;
  username: string | null;
  email: string | null;
}

export interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
}
