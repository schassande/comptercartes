import { DEFAULT_CONFIG_COINCHE, ListBonusCoinche } from './../../../model/coinche';
import { PartieCoinche } from './../../../model/coinche';
import { ActivatedRoute } from '@angular/router';
import { DateService } from './../../../service/DateService';
import { ConnectedUserService } from './../../../service/ConnectedUserService';
import { AlertController, NavController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PartieCoincheService } from 'src/app/service/PartieCoincheServic';
import { Observable, of } from 'rxjs';
import { flatMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-coinche-edit',
  templateUrl: './coinche-edit.page.html',
  styleUrls: ['./coinche-edit.page.scss'],
})
export class CoincheEditPage implements OnInit {

  partie: PartieCoinche = null;
  loading = false;
  readonly constants = {
    ListBonusCoinche,
  };
  errors: string[] = [];
  viewName: 'E'|'C' = 'E';
  valid = false;

  constructor(
    private alertCtrl: AlertController,
    private connectedUserService: ConnectedUserService,
    public dateService: DateService,
    public navController: NavController,
    private partieService: PartieCoincheService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadPartie().subscribe();
  }

  onViewChange() {
    this.ref.detectChanges();
    this.isValid();
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
      config: DEFAULT_CONFIG_COINCHE(),
      creationDate : new Date(),
      dataStatus: 'NEW',
      date: new Date(),
      version: 0,
      id: null,
      equipes: [
        {
          id: 0,
          joueur1: { name: this.connectedUserService.getCurrentUser().name},
          joueur2 : { name: '' },
          score: 0
        },
        {
          id: 1,
          joueur1: { name: ''},
          joueur2 : { name: ''},
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
  play() {
    if (this.isValid()) {
      return this.partieService.save(this.partie).pipe(
        map((rpartie) => {
          if (rpartie.data) {
            this.navController.navigateRoot(`/coinche/${rpartie.data.id}/play`);
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
    if (this.valid) {
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
    if (!this.partie.equipes[0].joueur1.name) {
      errors.push('Le joueur 1 de l\'équipe 1 n\' est pas défini.');
    }
    if (!this.partie.equipes[0].joueur2.name) {
      errors.push('Le joueur 2 de l\'équipe 1 n\' est pas défini.');
    }
    if (!this.partie.equipes[1].joueur1.name) {
      errors.push('Le joueur 1 de l\'équipe 2 n\' est pas défini.');
    }
    if (!this.partie.equipes[1].joueur2.name) {
      errors.push('Le joueur 2 de l\'équipe 2 n\' est pas défini.');
    }
    this.errors = errors;
    this.valid = errors.length === 0;
    return this.valid;
  }
}
