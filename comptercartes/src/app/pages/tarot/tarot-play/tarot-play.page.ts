import { DonneTarot } from './../../../model/jeux';
import { ActivatedRoute } from '@angular/router';
import { DateService } from './../../../service/DateService';
import { ConnectedUserService } from './../../../service/ConnectedUserService';
import { AlertController, NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { PartieTarotService } from 'src/app/service/PartieTarotService';
import { Observable, of } from 'rxjs';
import { PartieTarot } from 'src/app/model/jeux';
import { flatMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tarot-play',
  templateUrl: './tarot-play.page.html',
  styleUrls: ['./tarot-play.page.scss'],
})
export class TarotPlayPage implements OnInit {

  loading = false;
  partie: PartieTarot = null;
  donnesReverse: DonneTarot[] = [];

  constructor(
    private alertCtrl: AlertController,
    private connectedUserService: ConnectedUserService,
    public dateService: DateService,
    public navController: NavController,
    private partieService: PartieTarotService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadPartie().subscribe();
  }

  private loadPartie(): Observable<PartieTarot> {
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
    this.navController.navigateRoot(`/tarot/${this.partie.id}/donne/${donneIdx}/edit`);
  }
  newDonne() {
    this.navController.navigateRoot(`/tarot/${this.partie.id}/donne/-1/edit`);
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
