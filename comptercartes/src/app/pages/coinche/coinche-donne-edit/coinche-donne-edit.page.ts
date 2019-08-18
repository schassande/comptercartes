import { AlertOptions } from '@ionic/core';
import { flatMap, map, catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PartieCoincheService } from './../../../service/PartieCoincheServic';
import { DateService } from './../../../service/DateService';
import { AlertController, NavController } from '@ionic/angular';
import { PartieCoinche, DonneCoinche, DonneEquipeCoinche, TypeBonusCoinche, ListBonusCoinche } from './../../../model/coinche';
import { Component, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Component({
  selector: 'app-coinche-donne-edit',
  templateUrl: './coinche-donne-edit.page.html',
  styleUrls: ['./coinche-donne-edit.page.scss'],
})
export class CoincheDonneEditPage implements OnInit {

  partie: PartieCoinche = null;
  donne: DonneCoinche = null;
  loading = false;
  readonly constants = {  };
  errors: string[] = [];
  partieId: string;
  donneIdx: number;
  valid = false;

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

  getPartieScore(donneJoueur: DonneEquipeCoinche): number {
    const partieEquipe = this.partie.equipes.find(equipe => equipe.id === donneJoueur.id);
    return partieEquipe && partieEquipe.score ? partieEquipe.score : 0;
  }

  private loadPartie(): Observable<DonneCoinche> {
    this.loading = true;
    console.log('loadPartie begin');
    // load id from url path
    return this.route.paramMap.pipe(
      // load partie from the id
      flatMap( (paramMap) => {
        this.partieId = paramMap.get('id');
        const str = paramMap.get('donneIdx');
        console.log('donneIdx=' + JSON.stringify(str));
        this.donneIdx =  Number.parseInt(str, 10);
        return this.partieService.get(this.partieId);
      }),
      map( (rpartie) => {
        this.partie = rpartie.data;
        if (!this.partie) {
          // the partie has not been found => retour a la partie
          this.navController.navigateRoot('/partie/list');
        }
        // console.log('partie= ' + JSON.stringify(this.partie, null, 2));
        return this.partie;
      }),
      catchError((err) => {
        console.log('loadPartie error: ', err);
        this.loading = false;
        this.navController.navigateRoot('/partie/list');
        return of(this.partie);
      }),
      map (() => {
        if (this.donneIdx >= 0) {
          this.donne = this.partie.donnes[this.donneIdx];
          console.log(`donnes[${this.donneIdx}]=`, JSON.stringify(this.donne, null, 2));
        } else {
          this.createDonne();
          console.log(`New donne=`, JSON.stringify(this.donne, null, 2));
        }
        this.computeValidNScore();
        this.loading = false;
        return this.donne;
      })
    );
  }

  private createDonne() {
    this.donne = {
      prise: {
        contrat: {
            points: 80,
            capot: 'Non',
            couleurAtout: 'Trefle',
            opposition: 'Normal'
        },
        realise: { points: 82, capot: 'Non' },
      },
      equipes: this.partie.equipes.map( (equipe, idx) => {
        return {
          id: equipe.id,
          joueur1: equipe.joueur1,
          joueur2: equipe.joueur2,
          score: 0,
          role: idx === 0 ? 'Preneur' : 'Contre',
          bonus: [],
          donneGagne: true,
        } as DonneEquipeCoinche;
      }),
    };
  }

  get preneurId(): number {
    const preneur = this.donne.equipes.find((equipe) => equipe.role === 'Preneur');
    // console.log('getPreneurId(): ', preneur ? preneur.id : null);
    return preneur ? preneur.id : null;
  }

  set preneurId(equipeId: number) {
    const val = typeof equipeId === 'string' ? Number.parseInt(equipeId as string, 10) : equipeId;
    // console.log('setPreneurId(', equipeId, '): ', val, typeof equipeId);
    this.donne.equipes.forEach( equipe => {
      if (equipe.id === val) {
        equipe.role = 'Preneur';
      } else {
        equipe.role = 'Contre';
      }
    });
    this.computeValidNScore();
  }

  computeValidNScore(): boolean {
    if (this.computeValid()) {
      this.calculerScoresDonne();
    }
    return this.valid;
  }

  computeValid(): boolean {
    console.log(`computeValid():`, JSON.stringify(this.donne, null, 2));
    const errs: string[] = [];
    // check preneur/contre
    if (!((this.donne.equipes[0].role === 'Preneur' && this.donne.equipes[1].role === 'Contre' )
        || (this.donne.equipes[1].role === 'Preneur' && this.donne.equipes[0].role === 'Contre' ))) {
      errs.push('Preneur non défini.');
    }
    if (this.donne.prise.realise.points > 162) {
      errs.push('Le nombre de points réalisés ne peut être supérieur à 162.');
    }
    if (this.donne.prise.contrat.points < 0) {
      errs.push('Le nombre de points demandés ne peut être négatif.');
    }
    if (this.donne.prise.contrat.points > 850) {
      errs.push('Le nombre de points demandés est trop grand.');
    }
    if (this.donne.prise.realise.points < 0) {
      errs.push('Le nombre de points réalisés ne peut être négatif.');
    }
    if (this.donne.prise.realise.points > 162) {
      errs.push('Le nombre de points réalisés ne peut être supérieur à 162.');
    }
    this.errors = errs;
    this.errors.forEach( msg => console.log(msg));
    if (errs.length === 0) {
      console.log('pas d erreur');
    }
    this.valid = errs.length === 0;
    return this.valid;
  }

  hasScores() {
    return this.donne.equipes.filter(equipe => equipe.score === 0).length < 2;
  }

  public calculerScoresDonne() {
    if (!this.valid) {
      return;
    }
    // initialisation des score de la donne
    const equipePreneuse: DonneEquipeCoinche = this.donne.equipes.find( (equipe) => equipe.role === 'Preneur');
    const equipeContre: DonneEquipeCoinche = this.donne.equipes.find( (equipe) => equipe.role === 'Contre');
    if (this.donne.prise.contrat.capot === 'Non') {
      this.calculScoreNormal(equipePreneuse, equipeContre);
    } else if (this.donne.prise.contrat.capot === 'Capot') {
      this.calculScoreCapot(equipePreneuse, equipeContre);
    } else if (this.donne.prise.contrat.capot === 'General') {
      this.calculScoreGenerale(equipePreneuse, equipeContre);
    }
    const equipeGagnante: DonneEquipeCoinche = equipePreneuse.donneGagne ? equipePreneuse : equipeContre;
    const equipePerdante: DonneEquipeCoinche = equipePreneuse.donneGagne ? equipeContre : equipePreneuse;
    if (this.donne.prise.contrat.opposition === 'Coinche' || this.donne.prise.contrat.opposition === 'SurCoinche') {
      const coef: number = this.donne.prise.contrat.opposition === 'Coinche' ? 2 : 4;
      equipeGagnante.score = equipeGagnante.score * coef;
      equipePerdante.score = 0;
    }

    this.donne.equipes.forEach( (equipe) => console.log(equipe.id, equipe.score));
    this.computeValid();
  }

  private calculScoreNormal(equipePreneuse: DonneEquipeCoinche, equipeContre: DonneEquipeCoinche) {
    let pointsPreneur = 0;
    let pointsContre = 0;
    if (this.donne.prise.realise.capot === 'Non') {
      pointsPreneur = this.donne.prise.realise.points;
      pointsContre = 162 - this.donne.prise.realise.points;
    } else if (this.donne.prise.realise.capot === 'Capot') {
      pointsPreneur = 250;
    } else if (this.donne.prise.realise.capot === 'General') {
      pointsPreneur = 500;
    }
    equipePreneuse.bonus.forEach( (bonus) => pointsPreneur += this.partie.config.montantBonus[bonus.type]);
    equipeContre.bonus.forEach( (bonus) => pointsContre += this.partie.config.montantBonus[bonus.type]);
    equipePreneuse.donneGagne = pointsPreneur > this.donne.prise.contrat.points && pointsPreneur > pointsContre;
    equipeContre.donneGagne = !equipePreneuse.donneGagne;
    if (equipePreneuse.donneGagne) {
      if (this.partie.config.strategiePoint === 'PointsDemandesEtFaits') {
        equipePreneuse.score = this.donne.prise.contrat.points + this.arrondi(pointsPreneur);
        equipeContre.score = this.arrondi(pointsContre);
      } else if (this.partie.config.strategiePoint === 'PointsDemandes') {
        equipePreneuse.score = this.donne.prise.contrat.points;
        equipeContre.score = 0;
      }
    } else {
      if (this.partie.config.strategiePoint === 'PointsDemandesEtFaits') {
        equipeContre.score = this.donne.prise.contrat.points + 160;
        // TODO : ajouter les annonces des 2 équipes
      } else if (this.partie.config.strategiePoint === 'PointsDemandes') {
        equipeContre.score = this.donne.prise.contrat.points;
      }
      equipePreneuse.score = 0;
    }
  }

  private calculScoreCapot(equipePreneuse: DonneEquipeCoinche, equipeContre: DonneEquipeCoinche) {
    if (this.donne.prise.realise.capot === 'Non') {
      equipePreneuse.donneGagne = false;
      equipePreneuse.score = 0;
      if (this.partie.config.strategiePoint === 'PointsDemandesEtFaits') {
        equipeContre.score = 500;
      } else if (this.partie.config.strategiePoint === 'PointsDemandes') {
        equipeContre.score = 250;
      }
    } else if (this.donne.prise.realise.capot === 'Capot' || this.donne.prise.realise.capot === 'General') {
      equipePreneuse.donneGagne = true;
      if (this.partie.config.strategiePoint === 'PointsDemandesEtFaits') {
        equipePreneuse.score = 500;
      } else if (this.partie.config.strategiePoint === 'PointsDemandes') {
        equipePreneuse.score = 250;
      }
      equipeContre.score = 0;
    }
    equipeContre.donneGagne = !equipePreneuse.donneGagne;
  }
  private calculScoreGenerale(equipePreneuse: DonneEquipeCoinche, equipeContre: DonneEquipeCoinche) {
    if (this.donne.prise.realise.capot === 'Non' || this.donne.prise.realise.capot === 'Capot') {
      equipePreneuse.score = 0;
      equipePreneuse.donneGagne = false;
      if (this.partie.config.strategiePoint === 'PointsDemandesEtFaits') {
        equipeContre.score = 1000;
      } else if (this.partie.config.strategiePoint === 'PointsDemandes') {
        equipeContre.score = 500;
      }
    } else if (this.donne.prise.realise.capot === 'General') {
      equipePreneuse.donneGagne = true;
      if (this.partie.config.strategiePoint === 'PointsDemandesEtFaits') {
        equipePreneuse.score = 1000;
      } else if (this.partie.config.strategiePoint === 'PointsDemandes') {
        equipePreneuse.score = 500;
      }
      equipeContre.score = 0;
    }
  }

  calculerScoresPartie() {
    // initialisation des scores de la partie
    this.partie.equipes.forEach( (equipe) => equipe.score = 0);

    // addition des scores de toutes les donnes
    this.partie.donnes.forEach( (donne) => {
      this.ajouterScoreDonne(donne);
    });
    // dont la nouvelle donne
    if (this.donneIdx === -1) {
      this.ajouterScoreDonne(this.donne);
    }
  }

  ajouterScoreDonne(donne: DonneCoinche) {
    donne.equipes.forEach( (equipe) => {
      const de = this.partie.equipes.find((e) => e.id === equipe.id);
      if (de) {
        de.score += equipe.score;
      }
    });
  }

  saveNback() {
    if (this.valid) {
      if (this.donneIdx === -1) {
        // ajouter la donne a la partie
        this.partie.donnes.push(this.donne);
      }
      return this.partieService.save(this.partie).pipe(
        map((rpartie) => {
          if (rpartie.data) {
            this.back();
          } else {
            this.alertCtrl.create({ message: 'Erreur lors de la sauvegarde de la partie: ' + rpartie.error.error })
              .then( (alert) => alert.present() );
          }
        })
      ).subscribe();
    }
  }

  back() {
    this.navController.navigateRoot(`/coinche/${this.partieId}/play`);
  }
  delete() {
    if (this.donneIdx === -1) {
      this.back();
    } else {
      this.partie.donnes.splice(this.donneIdx, 1);
      this.calculerScoresPartie();
      return this.partieService.save(this.partie).pipe(
        map((rpartie) => {
          if (!rpartie.data) {
            this.alertCtrl.create({ message: 'Erreur lors de la sauvegarde de la partie: ' + rpartie.error.error })
              .then( (alert) => alert.present() );
          }
          this.back();
        })
      ).subscribe();
    }
  }

  ajouterBonus() {
    let eIdx = -1;
    this.demanderEquipe().pipe(
      flatMap( (equipeIdx) => {
        eIdx = equipeIdx;
        return this.demanderBonus();
      }),
      map( (bonus) => {
        console.log('Ajout du bonus ' + bonus + ' a l equipe ' + this.donne.equipes[eIdx].id);
        this.donne.equipes[eIdx].bonus.push({ type: bonus, etat: 'Positif'});
        this.computeValidNScore();
      })
    ).subscribe();
  }

  demanderEquipe(): Observable<number> {
    const res: Subject<number> = new Subject<number>();
    this.alertCtrl.create({
      message: 'Sélectionner l\'équipe qui a une annonce:',
      inputs: this.donne.equipes.map( (equipe, idx) => {
        return { type: 'radio', name: equipe.id, label: equipe.joueur1.name + '/' + equipe.joueur2.name, value: idx }  as AlertOptions;
      }),
      buttons: [
        { text: 'Annuler', role: 'cancel', handler: () => res.complete()},
        { text: 'Suivant',
          handler: (checkedIdx: number) => {
            res.next(checkedIdx);
            res.complete();
          }
        }]
      }).then( (alert) => alert.present());
    return res;
  }

  demanderBonus(): Observable<TypeBonusCoinche> {
    const res: Subject<TypeBonusCoinche> = new Subject<TypeBonusCoinche>();
    this.alertCtrl.create({
      message: 'Sélectionner l\'annonce:',
      inputs: ListBonusCoinche
        .filter((bonus) => this.partie.config.avecAnnonce || !bonus.annonce)
        .map( (bonus) => {
          return { type: 'radio', name: bonus.type, label: bonus.libelle, value: bonus.type };
        }),
      buttons: [
        { text: 'Annuler', role: 'cancel', handler: () => res.complete()},
        { text: 'Suivant', handler: (bonusType: TypeBonusCoinche) => {
          res.next(bonusType);
          res.complete();
        }}]
    }).then( (alert) => alert.present());
    return res;
  }
  getBonusLibelle(bonusType: TypeBonusCoinche) {
    // console.log('getBonusLibelle ', bonusType);
    return ListBonusCoinche.find((bonus) => bonus.type === bonusType);
  }

  deleteBonus(donneJoueur: DonneEquipeCoinche, bonusIdx: number) {
    donneJoueur.bonus.splice(bonusIdx, 1);
    this.computeValidNScore();
  }

  private arrondi(num: number): number {
    const reste = num % 10;
    const res = Math.floor(num / 10) * 10 + (reste < 5 ? 0 : 10);
    console.log('arrondi(' + num + ')' + res);
    return res;
  }
}
