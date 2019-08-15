import { TarotDonneEditPage } from './pages/tarot/tarot-donne-edit/tarot-donne-edit.page';
import { UserEditPage } from './pages/user/user-edit/user-edit';
import { UserLoginComponent } from './pages/user/user-login/user-login.component';
import { TarotPlayPage } from './pages/tarot/tarot-play/tarot-play.page';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './AuthGuard';
import { HomePage } from './pages/home/home.page';
import { NgModule } from '@angular/core';
import { PartieListPage } from './pages/partie/partie-list/partie-list.page';
import { TarotEditPage } from './pages/tarot/tarot-edit/tarot-edit.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage, canActivate: [AuthGuard] },

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
