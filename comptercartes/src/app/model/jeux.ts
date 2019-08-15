import { PersistentData } from './common';
import { Person } from './user';

export interface Joueur {
    person: Person;
    score: number;
}
export type EnchereTarot = 'Petite' | 'Pousse' | 'Garde' | 'Garde Sans' | 'Garde Contre';
export const ENCHERES: EnchereTarot[] = ['Petite', 'Pousse', 'Garde', 'Garde Sans', 'Garde Contre'];

export type TypeBonusTarot = 'BlancTete' | 'BlancAtout' | 'Poignee' | 'DoublePoignee' | 'TriplePoignee' | 'PetitAuBout';

export interface BonusTarotLibelle {
    type: TypeBonusTarot;
    defaultValue: number;
    libelle: string;
}
export const BONUS: BonusTarotLibelle [] = [
    {type: 'BlancTete', defaultValue: 10, libelle: 'Blanc de tete'},
    {type: 'BlancAtout', defaultValue: 10, libelle: 'Blanc de tete'},
    {type: 'Poignee', defaultValue: 10, libelle: 'Blanc de tete'},
    {type: 'DoublePoignee', defaultValue: 10, libelle: 'Blanc de tete'},
    {type: 'TriplePoignee', defaultValue: 10, libelle: 'Blanc de tete'},
    {type: 'PetitAuBout', defaultValue: 10, libelle: 'Blanc de tete'}
];

export function BonusPoint(bonus: TypeBonusTarot) {
    switch (bonus) {
        case 'BlancAtout': return 10;
        case 'BlancTete': return 10;
        case 'Poignee': return 20;
        case 'DoublePoignee': return 30;
        case 'TriplePoignee': return 40;
        case 'PetitAuBout': return 10;
    }
}
export type Chelem = 'Non' | 'Petit Chelem' | 'Grand Chelem';
export type EtatBonus = 'Positif' | 'Negatif';

export interface BonusTarot {
    type: TypeBonusTarot;
    etat: EtatBonus;
}
export type DonneRole = 'Partant' | 'Appele' | 'PartantAppele' | 'Contre';


export interface DonneJoueurTarot extends Joueur {
    role: DonneRole;
    bonus: BonusTarot[];
}

export interface DonneTarot {
    joueurs: DonneJoueurTarot[];
    enchere: EnchereTarot;
    depassement: number;
    chelemAnnonce: Chelem;
    chelemFait: Chelem;
}

export interface ConfigPartieTarot {
    montantBonus: any;
}

export interface Partie extends PersistentData {
    date: Date;
    shareToken: string;
    owner: string;
    userIds: string[];
}
export interface PartieTarot extends Partie {
    appelPartenaire: boolean;
    joueurs: Joueur[];
    donnes: DonneTarot[];
    config: ConfigPartieTarot;
}

export function DEFAULT_CONFIG_TAROT(): ConfigPartieTarot {
    const res =  {
        montantBonus: {
            BlancTete: 5,
            BlancAtout: 5,
            Poignee: 5,
            DoublePoignee: 10,
            TriplePoignee: 20,
            PetitAuBout: 10
        }
    };
    return res;
}

export type TypeBonusCoinche = 'Belote' | 'Tierce' | 'Cinquante' | 'Cent' | 'Carre' | 'Coinche' | 'Sur Coinche';

export interface BonusCoinche {
    type: TypeBonusCoinche;
    etat: EtatBonus;
}

export interface ConfigPartieCoinche {
    montantEncheres: Map<EnchereTarot, number>;
    montantBonus: Map<TypeBonusTarot, number>;
}

export interface Equipe {
    id: number;
    joueur1: Person;
    joueur2: Person;
    score: number;
}
export interface DonneEquipeCoinche extends Equipe {
    role: DonneRole;
    bonus: BonusTarot[];
}

export interface DonneCoinche {
    equipes: DonneEquipeCoinche[];
    contrat: number;
    depassement: number;
}

export interface PartieCoinche extends Partie {
    equipes: Equipe[];
    donnes: DonneCoinche[];
    config: ConfigPartieCoinche;
}
