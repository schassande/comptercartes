import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { ConnectedUserService } from './../../service/ConnectedUserService';

import { User } from '../../model/user';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  currentUser: User = null;
  showInstallBtn = false;
  deferredPrompt;

  constructor(
      private connectedUserService: ConnectedUserService,
      private changeDetectorRef: ChangeDetectorRef) {
  }
  public getShortName(): string {
    return this.currentUser.name;
  }

  public isLevelAdmin() {
      const role = this.currentUser.role;
      return role === 'PROFILE_ADMIN' || role === 'ADMIN';
  }

  ngOnInit() {
    this.currentUser = this.connectedUserService.getCurrentUser();
    this.changeDetectorRef.detectChanges();
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later on the button event.
      this.deferredPrompt = e;
    // Update UI by showing a button to notify the user they can add to home screen
      this.showInstallBtn = true;
    });
    window.addEventListener('appinstalled', (event) => console.log('App installed'));
  }

  addToHome() {
    // hide our user interface that shows our button
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the prompt');
        } else {
          console.log('User dismissed the prompt');
        }
        this.deferredPrompt = null;
      });
  }
}

