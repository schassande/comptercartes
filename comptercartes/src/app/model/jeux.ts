import { PersistentData } from './common';
import { Person } from './user';

export interface Joueur {
    person: Person;
    score: number;
}
export type EtatBonus = 'Positif' | 'Negatif';


export interface Partie extends PersistentData {
    date: Date;
    shareToken: string;
    owner: string;
    userIds: string[];
}
