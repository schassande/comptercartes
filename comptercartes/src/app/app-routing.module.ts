import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './AuthGuard';
import { CoincheDonneEditPage } from './pages/coinche/coinche-donne-edit/coinche-donne-edit.page';
import { CoincheEditPage } from './pages/coinche/coinche-edit/coinche-edit.page';
import { CoinchePlayPage } from './pages/coinche/coinche-play/coinche-play.page';
import { HomePage } from './pages/home/home.page';
import { TarotDonneEditPage } from './pages/tarot/tarot-donne-edit/tarot-donne-edit.page';
import { TarotEditPage } from './pages/tarot/tarot-edit/tarot-edit.page';
import { PartieListPage } from './pages/partie/partie-list/partie-list.page';
import { TarotPlayPage } from './pages/tarot/tarot-play/tarot-play.page';
import { UserEditPage } from './pages/user/user-edit/user-edit';
import { UserLoginComponent } from './pages/user/user-login/user-login.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomePage, canActivate: [AuthGuard] },

  { path: 'coinche/:id/edit', component: CoincheEditPage, canActivate: [AuthGuard] },
  { path: 'coinche/:id/play', component: CoinchePlayPage, canActivate: [AuthGuard] },
  { path: 'coinche/:id/donne/:donneIdx/edit', component: CoincheDonneEditPage, canActivate: [AuthGuard] },

  { path: 'partie/list', component: PartieListPage, canActivate: [AuthGuard] },

  { path: 'tarot/:id/edit', component: TarotEditPage, canActivate: [AuthGuard] },
  { path: 'tarot/:id/play', component: TarotPlayPage, canActivate: [AuthGuard] },
  { path: 'tarot/:id/donne/:donneIdx/edit', component: TarotDonneEditPage, canActivate: [AuthGuard] },

  { path: 'user/login', component: UserLoginComponent },
  { path: 'user/create', component: UserEditPage},
  { path: 'user/:id/edit', component: UserEditPage, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
