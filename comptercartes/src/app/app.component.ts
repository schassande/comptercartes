import { ConnectedUserService } from './service/ConnectedUserService';
import { LocalAppSettings } from './model/settings';
import { Component } from '@angular/core';

import { Platform, MenuController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UserService } from './service/UserService';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  /** The application settings store on device */
  appSetttings: LocalAppSettings;

  constructor(
    private navController: NavController,
    public connectedUserService: ConnectedUserService,
    private menu: MenuController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userService: UserService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  public reloadPage() {
    window.location.reload(true);
  }

  public route(url: string = '/home') {
    console.log('route(', url, ')');
    this.navController.navigateRoot(url);
    this.menu.close();
  }

  public logout() {
    this.userService.logout();
    this.route('/user/login');
  }
}

