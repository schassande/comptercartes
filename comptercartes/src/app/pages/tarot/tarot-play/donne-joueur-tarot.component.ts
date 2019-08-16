import { DonneJoueurTarot, DonneTarot } from './../../../model/tarot';
import { Joueur } from '../../../model/jeux';
import { Component, OnInit, Input } from '@angular/core';
@Component({
    selector: 'donne-joueur-tarot',
    template: `<div *ngIf="donneJoueur" style="text-align: center;">
    <span *ngIf="donneJoueur.role == 'Preneur' || donneJoueur.role == 'PreneurAppele'">
      {{enchere}} <span [ngStyle]="{'color':donne.depassement >= 0 ? 'green' : 'red' }">{{donne.depassement}}</span>
      </span>
      <ul *ngIf="donneJoueur.bonus">
        <li *ngFor="let bonus of donneJoueur.bonus"
          [ngStyle]="{'color':bonus.etat === 'Positif' ? 'green' : 'red' }">{{bonus.type}}
        </li>
      </ul>
      <div [ngStyle]="{'color':donneJoueur.score >= 0 ? 'green' : 'red' }">{{donneJoueur.score}}</div>
    </div>`,
    styles: [``],
  })
  export class DonneJoueurTarotComponent implements OnInit {

    @Input() joueur: Joueur;
    @Input() donne: DonneTarot;

    donneJoueur: DonneJoueurTarot = null;
    role: string;

    constructor() { }

    ngOnInit() {
      this.donneJoueur = this.donne.joueurs.find( (j) => j.person.name === this.joueur.person.name);
      this.role = this.getRole();

    }

    private getRole() {
      switch (this.donneJoueur.role) {
        case 'Appele': return 'Appelé';
        case 'Preneur': return 'Preneur';
        case 'PreneurAppele': return 'Auto';
        default: return null;
      }
    }

    get enchere() {
      switch (this.donne.enchere) {
        case 'Petite': return 'Pe';
        case 'Pousse': return 'Po';
        case 'Garde': return 'G';
        case 'Garde Sans': return 'GS';
        case 'Garde Contre': return 'GC';
      }
    }
  }
