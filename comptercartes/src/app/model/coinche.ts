import { EtatBonus, Partie } from './jeux';
import { Person } from './user';

export type TypeBonusCoinche = 'Belote' | 'Tierce' | 'Cinquante' | 'Cent' | 'Carre' | 'Carre9' | 'carreV';
export const ListBonusCoinche = [
    { type: 'Belote', defaultValue: 20, libelle: 'Belote', annonce: false},
    { type: 'Tierce', defaultValue: 20, libelle: 'Tierce', annonce: true},
    { type: 'Cinquante', defaultValue: 50, libelle: 'Cinquante', annonce: true},
    { type: 'Cent', defaultValue: 100, libelle: 'Cent', annonce: true},
    { type: 'Carre', defaultValue: 100, libelle: 'Carré', annonce: true},
    { type: 'Carre9', defaultValue: 150, libelle: 'Carré de 9', annonce: true},
    { type: 'CarreV', defaultValue: 200, libelle: 'Carré de Valet', annonce: true}
];

export type CoincheDonneRole = 'Preneur' | 'Contre';

export type CoincheStrategiePoint = 'PointsDemandes' | 'PointsDemandesEtFaits';

export interface BonusCoinche {
    type: TypeBonusCoinche;
    etat: EtatBonus;
}

export interface ConfigPartieCoinche {
    montantBonus: {
        Belote: number;
        Tierce: number;
        Cinquante: number;
        Cent: number;
        Carre: number;
        Carre9: number;
        CarreV: number;
    };
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
    donneGagne: boolean;
}

export type OppositionTypeCoinche = 'Normal' | 'Coinche' | 'SurCoinche';

export type CouleurAtout = 'Coeur' | 'Carreau' | 'Trefle' | 'Pique' | 'SansAtout' | 'ToutAtout';

export interface DonneCoinche {
    equipes: DonneEquipeCoinche[];
    prise: {
        contrat: {
            points: number;
            capot: 'Non' | 'Capot' | 'General';
            couleurAtout: CouleurAtout;
            opposition: OppositionTypeCoinche;
        };
        realise: {
            points: number;
            capot: 'Non' | 'Capot' | 'General';
        };
    };
}

export interface PartieCoinche extends Partie {
    equipes: Equipe[];
    donnes: DonneCoinche[];
    config: ConfigPartieCoinche;
}

export function DEFAULT_CONFIG_COINCHE(): ConfigPartieCoinche {
    return {
        montantBonus: {
            Belote: 20,
            Tierce: 20,
            Cinquante: 50,
            Cent: 100,
            Carre: 100,
            Carre9: 150,
            CarreV: 200
        },
        avecAnnonce: false,
        sansToutAtout: false,
        strategiePoint: 'PointsDemandesEtFaits'
    } as ConfigPartieCoinche;
}
