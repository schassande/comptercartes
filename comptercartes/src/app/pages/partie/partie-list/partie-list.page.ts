import { NavController, AlertController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { DateService } from '../../../service/DateService';
import { PartieCoincheService } from '../../../service/PartieCoincheServic';
import { PartieTarotService } from '../../../service/PartieTarotService';
import { PartieCoinche } from './../../../model/coinche';
import { PartieTarot } from './../../../model/tarot';
import { ResponseWithData } from '../../../service/response';

@Component({
  selector: 'app-partie-list',
  templateUrl: './partie-list.page.html',
  styleUrls: ['./partie-list.page.scss'],
})
export class PartieListPage implements OnInit {

  partieTarots: PartieTarot[] = [];
  partieCoinches: PartieCoinche[] = [];
  viewName: 'C'| 'T' = 'T';

  constructor(
    private alertCtrl: AlertController,
    public dateService: DateService,
    private navController: NavController,
    private partieCoincheService: PartieCoincheService,
    private partieTarotService: PartieTarotService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.searchPartieCoinches();
    this.searchPartieTarots();
  }
  onViewChange() {
    this.ref.detectChanges();
  }
  private searchPartieTarots() {
    this.partieTarotService.all().subscribe((rparties: ResponseWithData<PartieTarot[]>) => {
      this.partieTarots = this.partieTarotService.sortParties(rparties.data, true);
    });
  }
  private searchPartieCoinches() {
    this.partieCoincheService.all().subscribe((rparties: ResponseWithData<PartieCoinche[]>) => {
      this.partieCoinches = this.partieCoincheService.sortParties(rparties.data, true);
    });
  }

  partieTarotSelected(partie: PartieTarot) {
    this.navController.navigateRoot(`/tarot/${partie.id}/play`);
  }

  deletePartieTarot(partie: PartieTarot) {
    this.alertCtrl.create({
      message: 'Voulez-vous vraiment suppimer la partie ' + this.dateService.datetime2string(partie.date) + '?',
      buttons: [
        { text: 'Annuler', role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.partieTarotService.delete(partie.id).subscribe(() => this.searchPartieTarots());
          }
        }
      ]
    }).then( (alert) => alert.present() );
  }

  partieCoincheSelected(partie: PartieCoinche) {
    this.navController.navigateRoot(`/coinche/${partie.id}/play`);
  }

  deletePartieCoinche(partie: PartieCoinche) {
    this.alertCtrl.create({
      message: 'Voulez-vous vraiment suppimer la partie ' + this.dateService.datetime2string(partie.date) + '?',
      buttons: [
        { text: 'Annuler', role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.partieCoincheService.delete(partie.id).subscribe(() => this.searchPartieCoinches());
          }
        }
      ]
    }).then( (alert) => alert.present() );
  }

  newPartie() {
    if (this.viewName === 'C') {
      this.navController.navigateRoot('/coinche/-1/edit');
    } else if (this.viewName === 'T') {
      this.navController.navigateRoot('/tarot/-1/edit');
    }
  }
  importPartie() {
    this.alertCtrl.create({
      message: 'Entrer le code de la partie a importer: ',
      inputs: [{ type: 'text', id: 'code', label: 'Code' }],
      buttons: [
        { text: 'Annuler', role: 'cancel'},
        { text: 'Importer', handler: (data) => {
          const code = data[0] ? (data[0] as string).toUpperCase() : '';
          console.log('code=' + code);
          this.partieTarotService.importPartie(code).subscribe();
        }},
      ]
    }).then( (alert) => alert.present() );

  }
}
