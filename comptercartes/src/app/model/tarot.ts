import { Partie, Joueur, EtatBonus } from './jeux';

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
    {type: 'BlancAtout', defaultValue: 10, libelle: 'Blanc d\'atout'},
    {type: 'Poignee', defaultValue: 10, libelle: 'Poignée'},
    {type: 'DoublePoignee', defaultValue: 10, libelle: 'Double poignée'},
    {type: 'TriplePoignee', defaultValue: 10, libelle: 'Triple poignée'},
    {type: 'PetitAuBout', defaultValue: 10, libelle: 'Petit au bout'}
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

export interface BonusTarot {
    type: TypeBonusTarot;
    etat: EtatBonus;
}
export type DonneRoleTarot = 'Preneur' | 'Appele' | 'PreneurAppele' | 'Contre';


export interface DonneJoueurTarot extends Joueur {
    role: DonneRoleTarot;
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
