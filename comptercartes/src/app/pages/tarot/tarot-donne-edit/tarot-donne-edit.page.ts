import { PartieTarot, ENCHERES, DonneTarot, DonneJoueurTarot, TypeBonusTarot } from './../../../model/jeux';
import { ActivatedRoute } from '@angular/router';
import { DateService } from './../../../service/DateService';
import { ConnectedUserService } from './../../../service/ConnectedUserService';
import { AlertController, NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { PartieTarotService } from 'src/app/service/PartieTarotService';
import { Observable, of } from 'rxjs';
import { flatMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tarot-donne-edit',
  templateUrl: './tarot-donne-edit.page.html',
  styleUrls: ['./tarot-donne-edit.page.scss'],
})
export class TarotDonneEditPage implements OnInit {

  partie: PartieTarot = null;
  donne: DonneTarot = null;
  loading = false;
  readonly constants = {
    ENCHERES
  };
  errors: string[] = [];
  partieId: string;
  donneIdx: number;
  valid = false;

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

  get preneur() {
    const preneur: DonneJoueurTarot = this.donne.joueurs.find(joueur => joueur.role === 'Partant' || joueur.role === 'PartantAppele');
    return preneur ? preneur.person.name : '';
  }

  get appele() {
    const appele: DonneJoueurTarot = this.donne.joueurs.find(joueur => joueur.role === 'Appele' || joueur.role === 'PartantAppele');
    return appele ? appele.person.name : '';
  }

  getPartieScore(donneJoueur: DonneJoueurTarot): number {
    const partieJoueur = this.partie.joueurs.find(joueur => joueur.person.name === donneJoueur.person.name);
    return partieJoueur && partieJoueur.score ? partieJoueur.score : 0;
  }
  private loadPartie(): Observable<DonneTarot> {
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
    // this.partie.appelPartenaire

  }

  private createDonne() {
    this.donne = {
      enchere: 'Petite',
      depassement: 0,
      chelemAnnonce: 'Non',
      chelemFait: 'Non',
      joueurs:  this.partie.joueurs.map( (joueur) => {
        return {
          person: { name: joueur.person.name },
          score: 0,
          role: 'Contre',
          bonus: []
        } as DonneJoueurTarot;
      })
    };
  }

  onPreneur(event) {
    console.log('onPreneur', event);
    const preneur = event.detail.value;
    if (!preneur) {
      return;
    }
    this.donne.joueurs.forEach( (joueur) => {
      if (joueur.person.name === preneur) {
        if (joueur.role === 'Appele' || joueur.role === 'PartantAppele') {
          joueur.role = 'PartantAppele';
        } else {
          joueur.role = 'Partant';
        }
      } else { // le joueur n'est pas le preneur
        if (joueur.role === 'PartantAppele') {
          joueur.role = 'Appele';
        } else if (joueur.role !== 'Appele') {
          joueur.role = 'Contre';
        }
      }
    });
    this.computeValidNScore();
  }

  onAppele(event) {
    console.log('onAppele', event);
    const appele = event.detail.value;
    this.donne.joueurs.forEach( (joueur) => {
      if (!appele) {
        if (joueur.role === 'PartantAppele') {
          joueur.role = 'Partant';
        } else if (joueur.role !== 'Partant') {
          joueur.role = 'Contre';
        }
      } else if (joueur.person.name === appele) {
        if (joueur.role === 'Partant' || joueur.role === 'PartantAppele') {
          joueur.role = 'PartantAppele';
        } else {
          joueur.role = 'Appele';
        }
      } else { // Ce n'est pas le joueur appele
        if (joueur.role === 'PartantAppele') {
          joueur.role = 'Partant';
        } else if (joueur.role !== 'Partant') {
          joueur.role = 'Contre';
        }
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
    const errs: string[] = [];
    { // check nombre de joueur appele
      const nbAppel: number = this.donne.joueurs.filter(
        (joueur) => joueur.role === 'Appele' || joueur.role === 'PartantAppele').length;
      if (this.partie.appelPartenaire && nbAppel !== 1) {
        errs.push('Il y a aucun ou plusieurs joueurs appelés');
      } else if (!this.partie.appelPartenaire && nbAppel !== 0) {
        errs.push('Il ne faut pas de joueur appelé.');
      }
    }
    { // check nombre de joueur partant
      const nbPartant: number = this.donne.joueurs.filter(
        (joueur) => joueur.role === 'Partant' || joueur.role === 'PartantAppele').length;
      if (nbPartant !== 1) {
        errs.push('Il y a aucun ou plusieurs joueurs partants');
      }
    }
    { // check du nombre petit au bout
      const nbPetiAuBout: number = this.donne.joueurs.filter( (joueur) => {
        return joueur.bonus.filter( (bonus) => bonus.type === 'PetitAuBout').length;
      }).length;
      if (nbPetiAuBout > 1) {
        errs.push('Il ne peut y avoir plusieurs joueurs ayant emmené le petit au bout');
      }
    }
    {
      this.donne.joueurs.forEach( (joueur) => {
        // check joueur ayant plusieurs poignee
        const nbBonusPoignee = joueur.bonus.filter( (bonus) => {
          return bonus.type === 'Poignee'
            || bonus.type === 'DoublePoignee'
            || bonus.type === 'TriplePoignee';
        }).length;
        if (nbBonusPoignee > 1) {
          errs.push(joueur.person.name + ' ne peut avoir plusieurs annonces de poignée.');
        }
        const nbBonusBlancAtout = joueur.bonus.filter( (bonus) => bonus.type === 'BlancAtout').length;
        if (nbBonusBlancAtout > 0 && nbBonusPoignee > 0) {
          errs.push(joueur.person.name + ' ne peut avoir une poignée et etre blanc d atout en meme temps.');
        }
        const nbPetiAuBout = joueur.bonus.filter( (bonus) => bonus.type === 'PetitAuBout').length;
        if (nbBonusBlancAtout > 0 && nbPetiAuBout > 0) {
          errs.push(joueur.person.name + ' ne peut avoir etre blanc d atout et ammener le petit au bout en meme temps.');
        }
      });
    }
    let cumulScore = 0;
    this.donne.joueurs.forEach( (joueur) => cumulScore += joueur.score);
    if (cumulScore !== 0) {
      errs.push('La somme des scores n est pas égale à zero.');
      this.donne.joueurs.forEach( (joueur) => console.log(joueur.person.name, joueur.score));
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
    return this.donne.joueurs.filter(joueur => joueur.score === 0).length === 0;
  }

  public calculerScoresDonne() {
    // initialisation des score de la donne
    this.donne.joueurs.forEach( (joueur) => joueur.score = 0);

    // calcul de la base et du coef
    const base: number = 25 + Math.abs(this.donne.depassement);
    const coef = this.getCoef();

    // calcul de la part
    const part = this.calculerPart(coef, base);

    // Application de la part sur les joueurs
    this.applyPart(part);

    // Application des bonus non cedable (blanc et petit au bout)
    const bonusToApply: TypeBonusTarot[] = ['BlancAtout', 'BlancTete', 'PetitAuBout'];
    bonusToApply.forEach( (bonus) => {
      this.donne.joueurs.forEach( (joueur) => {
        if (joueur.bonus.filter((jb) => jb.type === bonus).length) {
          // Ce joueur a le bonus
          const partBonus: number = this.partie.config.montantBonus[bonus];
          this.donne.joueurs.forEach( (autreJoueur) => {
            if (joueur.person.name === autreJoueur.person.name) {
              autreJoueur.score += partBonus * this.donne.joueurs.length - 1;
            } else {
              autreJoueur.score -= partBonus;
            }
          });
        }
      });
    });
    this.donne.joueurs.forEach( (joueur) => console.log(joueur.person.name, joueur.score));
    this.computeValid();
  }

  private calculerPart(coef: number, base: number): number {
    let part = Math.round(base * coef);
    // Ajout des Poignees sur la part
    this.donne.joueurs.forEach( (joueur) => {
      joueur.bonus.forEach( (bonus) => {
        if (bonus.type === 'Poignee' || bonus.type === 'DoublePoignee' || bonus.type === 'TriplePoignee') {
          part += this.partie.config.montantBonus[bonus.type];
        }
      });
    });
    // Ajout des point Chelem sur la part
    part += this.getChelemPoint();

    // Si contrat n'est pas rempli alors la part est negative
    if (this.donne.depassement < 0) {
      part = -part;
    }
    return part;
  }
  private applyPart(part: number) {
    switch (this.donne.joueurs.length) {
      case 3:
        this.donne.joueurs.forEach( (joueur) => {
          switch (joueur.role) {
            case 'Partant':
                joueur.score = 2 * part;
                break;
            default:
              joueur.score = -part;
              break;
          }
        });
        break;

      case 4:
        this.donne.joueurs.forEach( (joueur) => {
          switch (joueur.role) {
            case 'PartantAppele':
              joueur.score = 3 * part;
              break;
            case 'Partant':
              joueur.score = (this.partie.appelPartenaire ? 1 : 3) * part;
              break;
            case 'Appele':
              joueur.score = part;
              break;
            case 'Contre':
              joueur.score = -part;
              break;
          }
        });
        break;

      case 5:
        this.donne.joueurs.forEach( (joueur) => {
          switch (joueur.role) {
            case 'PartantAppele':
              joueur.score = 4 * part;
              break;
            case 'Partant':
              joueur.score = 2 * part;
              break;
            case 'Appele':
              joueur.score = part;
              break;
            case 'Contre':
              joueur.score = -part;
              break;
          }
        });
        break;
    }
  }

  private getChelemPoint(): number {
    switch (this.donne.chelemAnnonce) {
      case 'Non':
        switch (this.donne.chelemFait) {
          case 'Non':
            return 0;
          case 'Petit Chelem':
            return 150;
          case 'Grand Chelem':
            return 200;
        }
        break;
      case 'Petit Chelem':
        switch (this.donne.chelemFait) {
          case 'Non':
              return -150;
          case 'Petit Chelem':
          case 'Grand Chelem':
              return 300;
        }
        break;
      case 'Grand Chelem':
        switch (this.donne.chelemFait) {
          case 'Non':
          case 'Petit Chelem':
              return -200;
          case 'Grand Chelem':
              return 400;
        }
    }
  }

  private getCoef(): number {
    switch (this.donne.enchere) {
      case 'Petite': return 1;
      case 'Pousse': return 1.5;
      case 'Garde': return 2;
      case 'Garde Sans': return 4;
      case 'Garde Contre': return 6;
      default: return 0;
    }
  }

  calculerScoresPartie() {
    // initialisation des scores de la partie
    this.partie.joueurs.forEach( (joueur) => joueur.score = 0);

    // addition des scores de toutes les donnes
    this.partie.donnes.forEach( (donne) => this.ajouterScoreDonne(donne));
    // dont la nouvelle donne
    if (this.donneIdx === -1) {
      this.ajouterScoreDonne(this.donne);
    }
  }

  ajouterScoreDonne(donne: DonneTarot) {
    donne.joueurs.forEach( (joueur) => {
      const dj = this.partie.joueurs.find((j) => j.person.name === joueur.person.name);
      if (dj) {
        dj.score += joueur.score;
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
    this.navController.navigateRoot(`/tarot/${this.partieId}/play`);
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
}
