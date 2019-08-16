import { Joueur } from './../../../model/jeux';
import { NavController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { flatMap, map, catchError } from 'rxjs/operators';

import { ConnectedUserService } from './../../../service/ConnectedUserService';
import { DateService } from '../../../service/DateService';
import { PartieTarotService } from '../../../service/PartieTarotService';
import { PartieTarot, DEFAULT_CONFIG_TAROT, ENCHERES, BONUS, TypeBonusTarot } from '../../../model/tarot';

@Component({
  selector: 'app-tarot-edit',
  templateUrl: './tarot-edit.page.html',
  styleUrls: ['./tarot-edit.page.scss'],
})
export class TarotEditPage implements OnInit {

  partie: PartieTarot = null;
  loading = false;
  readonly constants = {
    ENCHERES,
    BONUS
  };
  errors: string[] = [];
  viewName: 'J'|'B' = 'J';

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
          // the partie has not been found => create it
          this.createPartie();
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
        this.loading = false;
        return this.partie;
      })
    );
  }

  private createPartie() {
    this.partie = {
      appelPartenaire: false,
      config: DEFAULT_CONFIG_TAROT(),
      creationDate : new Date(),
      dataStatus: 'NEW',
      date: new Date(),
      version: 0,
      id: null,
      joueurs: [{
        person : { name: this.connectedUserService.getCurrentUser().name },
        score: 0
      },
      {
        person : { name: '' },
        score: 0
      },
      {
        person : { name: '' },
        score: 0
      }],
      lastUpdate : new Date(),
      owner: this.connectedUserService.getCurrentUser().id,
      donnes: [],
      userIds: [this.connectedUserService.getCurrentUser().id],
      shareToken: this.generateShareToken()
    };
  }

  private generateShareToken(): string {
    const chars = 'A0B1C2D3E4F5G6H7J8K9LMNPQRSTUVWXZ';
    const length = 5;
    let res = '';
    let lastNumber = 0;
    for (let i = 0; i < length; i++) {
      const idx: number = (((Math.random() * 100000) % chars.length) + lastNumber)  % chars.length;
      res += chars.substring(idx, idx + 1);
      lastNumber = idx;
    }
    console.log('generated token=', res);
    return res;
  }

  delete() {
    this.alertCtrl.create({
      message: 'Voulez-vous vraiment suppimer la partie ' + this.dateService.datetime2string(this.partie.date) + '?',
      buttons: [
        { text: 'Annuler', role: 'cancel'},
        {
          text: 'Delete',
          handler: () => {
            this.partieService.delete(this.partie.id).subscribe(() => {
              this.navController.navigateRoot('/partie/list');
            });
          }
        }
      ]
    }).then( (alert) => alert.present() );
  }

  saveNback() {
    if (this.isValid()) {
      return this.partieService.save(this.partie).pipe(
        map((rpartie) => {
          if (rpartie.data) {
            this.back();
          } else {
            this.alertCtrl.create({ message: 'Error when saving the competition: ' + rpartie.error.error })
              .then( (alert) => alert.present() );
          }
        })
      ).subscribe();
    }
  }

  back() {
    this.navController.navigateRoot(`/partie/list`);
  }

  isValid(): boolean {
    const errors: string[] = [];
    this.partie.joueurs.forEach( (joueur, idx) => {
      if (!joueur.person.name) {
        errors.push(`Le joueur ${idx + 1} n'est pas defini.`);
      }
    });
    return errors.length === 0;
  }

  onSwipe(event) {
    // console.log('onSwipe', event);
    if (event.direction === 4) {
      this.saveNback();
    }
  }

  newBonusValue(bonus: TypeBonusTarot, event) {
    console.log('Affection de la valeur ' + event.detail.value + ' au bonus ' + bonus);
    this.partie.config.montantBonus[bonus] = event.detail.value;
  }

  play() {
    if (this.isValid()) {
      return this.partieService.save(this.partie).pipe(
        map((rpartie) => {
          if (rpartie.data) {
            this.navController.navigateRoot(`/tarot/${rpartie.data.id}/play`);
          } else {
            this.alertCtrl.create({ message: 'Erreur de sauvegarde: ' + rpartie.error.error })
              .then( (alert) => alert.present() );
          }
        })
      ).subscribe();
    } else {
      this.alertCtrl.create({ message: 'La partie n est pas configuree correctement: ' })
      .then( (alert) => alert.present() );
    }
  }

  resetScores() {
    this.partie.donnes = [];
    this.partie.joueurs.forEach( (joueur) => joueur.score = 0);
  }

  dupliquer() {
    // TODO
  }

  onNbJoueursChange(nbJoueur: number) {
    while (this.partie.joueurs.length < nbJoueur) {
      // console.log('Ajout d un joueur');
      this.partie.joueurs.push({ person: { name: ''}, score: 0});
    }
    while (this.partie.joueurs.length > nbJoueur) {

      const idxOfEmpty = this.findLastIndex(this.partie.joueurs, (joueur) => !joueur.person.name);
      if (idxOfEmpty < 0) {
        // console.log('Suppression du dernier joueur');
        this.partie.joueurs.splice(this.partie.joueurs.length - 1, 1);
      } else {
        // console.log('Suppression du joueur ' + (idxOfEmpty + 1));
        this.partie.joueurs.splice(idxOfEmpty, 1);
      }
    }
  }

  findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array)) {
            return l;
        }
    }
    return -1;
  }
}
