import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { flatMap, map, catchError } from 'rxjs/operators';

import { DateService } from '../../../service/DateService';
import { PartieCoinche, DonneCoinche } from '../../../model/coinche';
import { Observable, of } from 'rxjs';
import { PartieCoincheService } from 'src/app/service/PartieCoincheServic';

@Component({
  selector: 'app-coinche-play',
  templateUrl: './coinche-play.page.html',
  styleUrls: ['./coinche-play.page.scss'],
})
export class CoinchePlayPage implements OnInit {

  loading = false;
  partie: PartieCoinche = null;
  donnesReverse: DonneCoinche[] = [];

  constructor(
    private alertCtrl: AlertController,
    public dateService: DateService,
    public navController: NavController,
    private partieService: PartieCoincheService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadPartie().subscribe();
  }

  private loadPartie(): Observable<PartieCoinche> {
    this.loading = true;
    console.log('loadPartie begin');
    // load id from url path
    return this.route.paramMap.pipe(
      // load partie from the id
      flatMap( (paramMap) => this.partieService.get(paramMap.get('id'))),
      map( (rpartie) => {
        this.partie = rpartie.data;
        if (!this.partie) {
          this.navController.navigateRoot('/partie/list');
        }
        // console.log('partie= ' + JSON.stringify(this.partie, null, 2));
        return this.partie;
      }),
      catchError((err) => {
        console.log('loadPartie error: ', err);
        this.loading = false;
        return of(this.partie);
      }),
      map (() => {
        console.log('loadPartie end');
        this.donnesReverse = this.partie.donnes.slice().reverse();
        this.loading = false;
        return this.partie;
      })
    );
  }

  onSelectDonne(donneIdx: number) {
    this.navController.navigateRoot(`/coinche/${this.partie.id}/donne/${donneIdx}/edit`);
  }

  newDonne() {
    this.navController.navigateRoot(`/coinche/${this.partie.id}/donne/-1/edit`);
  }

  share() {
    this.alertCtrl.create({
      message: 'Voici le code de la partie pour l\'importation: ' + this.partie.shareToken,
      buttons: [
        { text: 'Ok', role: 'cancel'},
      ]
    }).then( (alert) => alert.present() );
  }
}
