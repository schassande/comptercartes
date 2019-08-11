import { PersistentData } from './common';
import { Person } from './user';

export interface Joueur {
    person: Person;
    score: number;
}
export type EnchereTarot = 'Petite' | 'Pousse' | 'Garde' | 'Garde Sans' | 'Garde Contre' | 'Petit Chelem' | 'Grand Chelem';

export type TypeBonusTarot = 'Blanc Tete' | 'Blanc Atout' | 'Poignee' | 'Double Poignee' | 'Triple Poignee';

export type EtatBonus = 'Positif' | 'Negatif';

export interface BonusTarot {
    person: Person;
    type: TypeBonusTarot;
    etat: EtatBonus;
}

export interface DonneTarot {
    joueurPartant: Joueur;
    joueurAppele: Joueur;
    adversaires: Joueur[];
    enchere: EnchereTarot;
    bonus: BonusTarot[];
}

export interface ConfigPartieTarot {
    montantEncheres: Map<EnchereTarot, number>;
    montantBonus: Map<TypeBonusTarot, number>;
}

export interface Partie extends PersistentData {
    date: Date;
    lieu: string;
    shareToken: string;
}
export interface PartieTarot extends Partie {
    joueurs: Joueur[];
    parties: DonneTarot[];
    config: ConfigPartieTarot;
}

export const DEFAULT_CONFIG_TAROT: ConfigPartieTarot = {
    montantEncheres: new Map()
        .set('Petite', 20)
        .set('Pousse', 30)
        .set('Garde', 40)
        .set('Garde Sans', 80)
        .set('Garde Contre', 160)
        .set('Petit Chelem', 250)
        .set('Grand Chelem', 500),
    montantBonus: new Map()
        .set('Blanc Tete', 5)
        .set('Blanc Atout', 5)
        .set('Poignee', 5)
        .set('Double Poignee', 10)
        .set('Triple Poignee', 20)
};

export type TypeBonusCoinche = 'Belote' | 'Tierce' | 'Cinquante' | 'Cent' | 'Carre' | 'Coinche' | 'Sur Coinche';

export interface BonusCoinche {
    equipe: Equipe;
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

export interface DonneCoinche {
    equipePartante: Equipe;
    adversaire: Equipe;
    contrat: number;
    bonus: BonusCoinche[];
}

export interface PartieCoinche extends Partie {
    equipes: Equipe[];
    parties: DonneCoinche[];
    config: ConfigPartieCoinche;
}
