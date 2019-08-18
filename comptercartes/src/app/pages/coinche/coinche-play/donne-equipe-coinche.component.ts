import { DonneEquipeCoinche } from './../../../model/coinche';
import { DonneCoinche } from './../../../model/coinche';
import { Equipe } from './../../../model/coinche';
import { Component, OnInit, Input } from '@angular/core';
@Component({
    selector: 'donne-equipe-coinche',
    template: `
    <div *ngIf="donneEquipe" style="text-align: center;">
      <div *ngIf="donneEquipe.role == 'Preneur'">
        <div>{{donne.prise.contrat.capot == 'Non' ? donne.prise.contrat.points : donne.prise.contrat.capot }}
        <img src="assets/imgs/coeur.png"   *ngIf="donne.prise.contrat.couleurAtout == 'Coeur'"   height="20">
        <img src="assets/imgs/carreau.png" *ngIf="donne.prise.contrat.couleurAtout == 'Carreau'" height="20">
        <img src="assets/imgs/trefle.png"  *ngIf="donne.prise.contrat.couleurAtout == 'Trefle'"  height="20">
        <img src="assets/imgs/pique.png"   *ngIf="donne.prise.contrat.couleurAtout == 'Pique'"   height="20">
        <span *ngIf="donne.prise.contrat.couleurAtout == 'SansAtout'">SA</span>
        <span *ngIf="donne.prise.contrat.couleurAtout == 'ToutAtout'">TA</span>
        {{coinche}}</div>
        <div>{{donne.prise.realise.capot == 'Non' ? donne.prise.realise.points : donne.prise.realise.capot }}</div>
      </div>
      <div *ngFor="let bonus of donneEquipe.bonus">{{bonus.type}}</div>
      <div [ngStyle]="{'color':donneEquipe.donneGagne ? 'green' : 'red' }">{{donneEquipe.score}}</div>
    </div>`,
    styles: [``],
  })
export class DonneEquipeCoincheComponent implements OnInit {

  @Input() equipe: Equipe;
  @Input() donne: DonneCoinche;

  donneEquipe: DonneEquipeCoinche = null;
  coinche: string;

  constructor() { }

  ngOnInit() {
    this.donneEquipe = this.donne.equipes.find( (e) => e.id === this.equipe.id);
    this.coinche = this.getCoinche();
  }

  getCoinche() {
    switch (this.donne.prise.contrat.opposition) {
      case 'Coinche': return 'C';
      case 'SurCoinche' : return 'SC';
      default: return '';
    }
  }
}
