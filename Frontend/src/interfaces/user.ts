export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CUSTOMER';
}