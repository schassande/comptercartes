import { DateService } from './DateService';
import { ConnectedUserService } from './ConnectedUserService';
import { AngularFirestore, Query } from 'angularfire2/firestore';
import { ResponseWithData } from './response';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { RemotePersistentDataService } from './RemotePersistentDataService';
import { ToastController } from '@ionic/angular';
import { PartieTarot } from '../model/jeux';
import { flatMap } from 'rxjs/operators';

@Injectable()
export class PartieTarotService extends RemotePersistentDataService<PartieTarot> {

    constructor(
      private connectedUserService: ConnectedUserService,
      db: AngularFirestore,
      private dateService: DateService,
      toastController: ToastController
    ) {
        super(db, toastController);
    }

    getLocalStoragePrefix() {
        return 'partie-tarot';
    }

    getPriority(): number {
        return 2;
    }
    protected adjustFieldOnLoad(item: PartieTarot) {
      item.date = this.adjustDate(item.date, this.dateService);
    }

    public all(): Observable<ResponseWithData<PartieTarot[]>> {
      return this.allO('default');
    }

    /**
     * Overide to restrict to the partieTarot of the user.
     * Provide option to define the source of the data: 'default' | 'server' | 'cache'
     */
    public allO(options: 'default' | 'server' | 'cache' = 'default'): Observable<ResponseWithData<PartieTarot[]>> {
      return this.query(this.getBaseQueryMyParties(), options);
    }

    /** Query basis for coaching limiting access to the coachings of the user */
    private getBaseQueryMyParties(): Query {
      return this.getCollectionRef().where('userIds', 'array-contains', this.connectedUserService.getCurrentUser().id);
    }

    public sortParties(parties: PartieTarot[], reverse: boolean = false): PartieTarot[] {
        let array: PartieTarot[] = parties.sort(this.comparePartie.bind(this));
        if (reverse) {
            array = array.reverse();
        }
        return array;
    }

    public searchParties(text: string, options: 'default' | 'server' | 'cache' = 'default'): Observable<ResponseWithData<PartieTarot[]>> {
        const str = text !== null && text && text.trim().length > 0 ? text.trim() : null;
        return str ?
            super.filter(this.allO(options), (partie: PartieTarot) => {
                return partie.joueurs.filter( (joueur) => this.stringContains(str, joueur.person.name)).length > 0;
            })
            : this.allO(options);
    }

    public comparePartie(item1: PartieTarot, item2: PartieTarot): number {
      let res = 0;
      if (res === 0) {
        // Compare date
        res = this.dateService.compareDate(item1.date, item2.date);
      }
      return res;
    }
    public importPartie(code: string): Observable<ResponseWithData<PartieTarot>> {
      return this.queryOne(this.getCollectionRef().where('shareToken', '==', code), 'server').pipe(
        flatMap( (rpartie: ResponseWithData<PartieTarot>) => {
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
