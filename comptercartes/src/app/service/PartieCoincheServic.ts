import { DateService } from './DateService';
import { ConnectedUserService } from './ConnectedUserService';
import { AngularFirestore, Query } from 'angularfire2/firestore';
import { ResponseWithData } from './response';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { RemotePersistentDataService } from './RemotePersistentDataService';
import { ToastController } from '@ionic/angular';
import { PartieCoinche } from '../model/coinche';
import { flatMap } from 'rxjs/operators';


@Injectable()
export class PartieCoincheService extends RemotePersistentDataService<PartieCoinche> {

    constructor(
      private connectedUserService: ConnectedUserService,
      db: AngularFirestore,
      private dateService: DateService,
      toastController: ToastController
    ) {
        super(db, toastController);
    }

    getLocalStoragePrefix() {
        return 'partie-coinche';
    }

    getPriority(): number {
        return 2;
    }
    protected adjustFieldOnLoad(item: PartieCoinche) {
      item.date = this.adjustDate(item.date, this.dateService);
    }
    public all(): Observable<ResponseWithData<PartieCoinche[]>> {
      return this.allO('default');
    }

    /**
     * Overide to restrict to the PartieCoinche of the user.
     * Provide option to define the source of the data: 'default' | 'server' | 'cache'
     */
    public allO(options: 'default' | 'server' | 'cache' = 'default'): Observable<ResponseWithData<PartieCoinche[]>> {
      return this.query(this.getBaseQueryMyParties(), options);
    }

    /** Query basis for coaching limiting access to the coachings of the user */
    private getBaseQueryMyParties(): Query {
      return this.getCollectionRef().where('userIds', 'array-contains', this.connectedUserService.getCurrentUser().id);
    }


    public sortParties(parties: PartieCoinche[], reverse: boolean = false): PartieCoinche[] {
        let array: PartieCoinche[] = parties.sort(this.comparePartie.bind(this));
        if (reverse) {
            array = array.reverse();
        }
        return array;
    }

    public searchParties(text: string, options: 'default' | 'server' | 'cache' = 'default'): Observable<ResponseWithData<PartieCoinche[]>> {
        const str = text !== null && text && text.trim().length > 0 ? text.trim() : null;
        return str ?
            super.filter(this.allO(options), (partie: PartieCoinche) => {
                return partie.equipes.filter( (equipe) => this.stringContains(str, equipe.joueur1.name)
                  || this.stringContains(str, equipe.joueur2.name)).length > 0;
            })
            : this.allO(options);
    }

    public comparePartie(item1: PartieCoinche, item2: PartieCoinche): number {
      let res = 0;
      if (res === 0) {
        // Compare date
        res = this.dateService.compareDate(item1.date, item2.date);
      }
      return res;
    }
    public importPartie(code: string): Observable<ResponseWithData<PartieCoinche>> {
      return this.queryOne(this.getCollectionRef().where('shareToken', '==', code), 'server').pipe(
        flatMap( (rpartie: ResponseWithData<PartieCoinche>) => {
          if (rpartie.data) {
            rpartie.data.userIds.push(this.connectedUserService.getCurrentUser().id);
            return this.save(rpartie.data);
          } else {
            return of (rpartie);
          }
        })
      );
    }
}
