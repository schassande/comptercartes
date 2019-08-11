import { HasId } from './common';

export interface Person {
    name: string;
}

export type AppRole = 'USER' | 'PROFILE_ADMIN' | 'ADMIN';
export type AccountStatus = 'VALIDATION_REQUIRED' | 'ACTIVE' | 'LOCKED' | 'DELETED';

export interface User extends Person, HasId {
    email: string;
    password?: string;
    accountId: string;
    token?: string;
    role: AppRole;
    accountStatus: AccountStatus;
}
