import { EtatBonus, Partie } from './jeux';
import { Person } from './user';

export type TypeBonusCoinche = 'Belote' | 'Tierce' | 'Cinquante' | 'Cent' | 'Carre' | 'Coinche' | 'Sur Coinche';

export type CoincheDonneRole = 'Preneur' | 'Contre';

export type CoincheStrategiePoint = 'PointsDemandes' | 'PointFaits' | 'PointsDemandesEtFaits';

export interface BonusCoinche {
    type: TypeBonusCoinche;
    etat: EtatBonus;
}

export interface ConfigPartieCoinche {
    montantBonus: Map<TypeBonusCoinche, number>;
    avecAnnonce: boolean;
    sansToutAtout: boolean;
    strategiePoint: CoincheStrategiePoint;
}

export interface Equipe {
    id: number;
    joueur1: Person;
    joueur2: Person;
    score: number;
}

export interface DonneEquipeCoinche extends Equipe {
    role: CoincheDonneRole;
    bonus: BonusCoinche[];
}

export type OppositionTypeCoinche = 'Normal' | 'Coinche' | 'SurCoinche';

export type CouleurAtout = 'Coeur' | 'Carreau' | 'Trefle' | 'Pique' | 'SansAtout' | 'ToutAtout';

export interface DonneCoinche {
    equipes: DonneEquipeCoinche[];
    contrat: number;
    opposition: OppositionTypeCoinche;
    couleurAtout: CouleurAtout;
    pointsFaits: number;
}

export interface PartieCoinche extends Partie {
    equipes: Equipe[];
    donnes: DonneCoinche[];
    config: ConfigPartieCoinche;
}
