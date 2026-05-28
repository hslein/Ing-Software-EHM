export interface UserDetails {
  email?: string;
  displayName?: string;
  birthdate?: string;
  role?: 'admin' | 'customer';
  updatedAt?: unknown;
  createdAt?: unknown;
}


export interface UserSummary {
  uid: string;
  email: string | null;
  role: 'admin' | 'customer';
  createdAt?: unknown;
};