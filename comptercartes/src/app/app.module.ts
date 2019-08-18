import { DonneEquipeCoincheComponent } from './pages/coinche/coinche-play/donne-equipe-coinche.component';
import { CoincheEditPage } from './pages/coinche/coinche-edit/coinche-edit.page';
import { CoincheDonneEditPage } from './pages/coinche/coinche-donne-edit/coinche-donne-edit.page';
import { DonneJoueurTarotComponent } from './pages/tarot/tarot-play/donne-joueur-tarot.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule } from '@angular/forms';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireModule } from 'angularfire2';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';


import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppSettingsService } from './service/AppSettingsService';
import { ConnectedUserService } from './service/ConnectedUserService';
import { DateService } from './service/DateService';
import { LocalDatabaseService } from './service/LocalDatabaseService';
import { PartieCoincheService } from './service/PartieCoincheServic';
import { PartieTarotService } from './service/PartieTarotService';
import { ToolService } from './service/ToolService';
import { UserService } from './service/UserService';

import { TarotPlayPage } from './pages/tarot/tarot-play/tarot-play.page';
import { TarotEditPage } from './pages/tarot/tarot-edit/tarot-edit.page';
import { UserEditPage } from './pages/user/user-edit/user-edit';
import { UserLoginComponent } from './pages/user/user-login/user-login.component';
import { HomePage } from './pages/home/home.page';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { PartieListPage } from './pages/partie/partie-list/partie-list.page';
import { environment } from '../environments/environment';
import { TarotDonneEditPage } from './pages/tarot/tarot-donne-edit/tarot-donne-edit.page';
import { CoinchePlayPage } from './pages/coinche/coinche-play/coinche-play.page';

export class CustomHammerConfig extends HammerGestureConfig {}

@NgModule({
  declarations: [AppComponent,
    CoincheDonneEditPage, CoincheDonneEditPage, CoinchePlayPage, CoincheEditPage,
    DonneJoueurTarotComponent, DonneEquipeCoincheComponent,
    HomePage,
    PartieListPage,
    TarotDonneEditPage, TarotEditPage, TarotPlayPage,
    UserLoginComponent, UserEditPage
  ],
  entryComponents: [AppComponent, HomePage],
  imports: [BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicStorageModule.forRoot({ name: '__myDb', driverOrder : [ 'indexeddb', 'websql', 'sqlite']}),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    AngularFireFunctionsModule,
  ],
  providers: [
    AppSettingsService,
    ConnectedUserService,
    DateService,
    LocalDatabaseService,
    PartieCoincheService,
    PartieTarotService,
    SplashScreen,
    StatusBar,
    ToolService,
    UserService,
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
