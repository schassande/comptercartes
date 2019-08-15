import { PersistentData } from './common';

export interface Person {
    name: string;
}

export type AppRole = 'USER' | 'PROFILE_ADMIN' | 'ADMIN';
export type AccountStatus = 'VALIDATION_REQUIRED' | 'ACTIVE' | 'LOCKED' | 'DELETED';

export interface User extends Person, PersistentData {
    email: string;
    password?: string;
    accountId: string;
    token?: string;
    role: AppRole;
    accountStatus: AccountStatus;
}
