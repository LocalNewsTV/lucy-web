/**
 *  Copyright © 2019 Province of British Columbia
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * 	Unless required by applicable law or agreed to in writing, software
 * 	distributed under the License is distributed on an "AS IS" BASIS,
 * 	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 	See the License for the specific language governing permissions and
 * 	limitations under the License.
 *
 * 	Created by Amir Shayegh on 2019-10-23.
 */
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SsoService } from '../services/sso.service';
import { AppRoutes } from '../constants';
import { RouterService } from '../services/router.service';
import { Message } from '../models/Message';
import { MessageService } from '../services/message.service';
import * as bootstrap from 'bootstrap';
import * as $AB from 'jquery';
import { AlertModel, AlertService } from '../services/alert.service';
import { Subscription } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { ErrorService } from '../services/error.service';
import { StringConstants } from 'src/app/constants/string-constants';
import { ToastService, ToastModel, ToastIconType } from '../services/toast/toast.service';
import { ConverterService } from '../services/coordinateConversion/location.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private authStatusIsLoading: boolean | null = null;

  public get isAuthenticated(): boolean {
    if (this.authStatusIsLoading === null || this.authStatusIsLoading) {
      return false;
    }
    return this.ssoService.isAuthenticated();
  }

  get isReady(): boolean {
    return this.authStatusIsLoading === false;
  }

  public userAccessUpdatedMessage: Message;
  public userAccessUpdatedMessages: Message[];

  // ALERTS
  public alertMessage: AlertModel;
  private alertsSubscription: Subscription;
  ////////

  // Toasts
  public toastMessage: ToastModel;
  private toastSubscription: Subscription;
  ////////


  // Lottie Animation
  public lottieConfig: Object;
  private anim: any;
  private animationSpeed = 1;
  showLoading = false;
  private loadingSubscription: Subscription;
  /////////////////

  constructor(
    private errorService: ErrorService,
    private coodrinateConvert: ConverterService,
    private routerService: RouterService,
    private ssoService: SsoService,
    private messageService: MessageService,
    private alertService: AlertService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private titleService: Title) {
    this.setupLoadingIcon();
    this.subscribeToAlertService();
    this.subscribeToToastService();
    this.setTitle();
  }

  ngOnInit() {
    this.temp_testHex();
  }

  temp_testInOut() {
    const first = this.coodrinateConvert.isInsideBC(-125.12345, 51.12345);
    const second = this.coodrinateConvert.isInsideBC(-151.21, 55.49);
    const third = this.coodrinateConvert.isInsideBC(-138.12, 48.9215);
    const forth = this.coodrinateConvert.isInsideBC(-123.0164, 48.7951);
    const fifth = this.coodrinateConvert.isInsideBC(-123.0, 53.0);
    console.log('-125.12345, 51.12345 -> ' + first);
    console.log('-151.21, 55.49 -> ' + second);
    console.log('-138.12, 48.9215 ->' + third);
    console.log('-123.0164, 48.7951 ->' + forth);
    console.log('-123.0, 53.0 -> ' + fifth);
  }

  temp_testHex() {
    const test_1 = this.coodrinateConvert.getHexId(-126.000000, 54.000000);
    console.log('1 -> ' + test_1.cc);
    console.dir(test_1);
  }

  ngOnDestroy() {
    this.unSubscribeFromAlertService();
    this.unSubscribeFromLoadingService();
    this.unSubscribeFromToastService();
  }

  ngAfterViewInit() {
    this.subscribeToLoadingService();
    this.reRouteIfNeeded();
    // this.testAlerts();
    // this.testToasts();
  }

  /******** Loading animation ********/
  setupLoadingIcon() {
    this.lottieConfig = {
      path: 'https://assets3.lottiefiles.com/datafiles/fPx4vaZrul2Fvg9/data.json',
      // path: 'src/assets/loading.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };
  }

  handleAnimation(anim: any) {
    this.anim = anim;
  }

  stopLoadingAnimation() {
    this.anim.stop();
  }

  playLoadingAnimation() {
    this.anim.play();
  }

  pauseLoadingAnimation() {
    this.anim.pause();
  }

  setSpeedOfLoadingAnimation(speed: number) {
    this.animationSpeed = speed;
    this.anim.setSpeed(speed);
  }

  private subscribeToLoadingService() {
    this.loadingSubscription = this.loadingService.getObservable().subscribe(show => {
      this.showLoading = show;
      this.cdr.detectChanges();
    });
  }

  private unSubscribeFromLoadingService() {
    if (!this.loadingSubscription) {return; }
    this.loadingSubscription.unsubscribe();
  }

  /******** End Loading animation ********/

  /******** Alerts ********/
  private subscribeToAlertService() {
    this.alertsSubscription = this.alertService.getObservable().subscribe(message => {
      if (message) {
        this.alertMessage = message;
      } else {
        this.alertMessage = undefined;
      }
    });
  }

  private unSubscribeFromAlertService() {
    if (!this.alertsSubscription) {return; }
    this.alertsSubscription.unsubscribe();
  }
  /******** End Alerts ********/

  /******** Toasts ********/
  private subscribeToToastService() {
    this.toastSubscription = this.toastService.getObservable().subscribe(message => {
      if (message) {
        this.toastMessage = message;
      } else {
        this.alertMessage = undefined;
      }
    });
  }

  private unSubscribeFromToastService() {
    if (!this.toastSubscription) {return; }
    this.toastSubscription.unsubscribe();
  }
  /******** End Toasts ********/

  /******** Auth and Routing ********/
  private async reRouteIfNeeded() {
    this.loadingService.add();
    const isAuthenticated =  await this.checkAuthStatus();
    if (isAuthenticated && (this.routerService.current === AppRoutes.Root) || this.routerService.current === undefined) {

      // if last route is specified in session (from Login component), go to it and remove key from session.
      const lastRoute = this.routerService.getLastRouteInSession();
      if (lastRoute) {
        this.routerService.navigateTo(lastRoute);
        this.routerService.clearLastRouteInSession();
      } else {
        // Otherwise go to profile
        this.routerService.navigateTo(AppRoutes.Profile);
      }
    }
    this.loadingService.remove();
  }

  private async checkAuthStatus(): Promise<boolean> {
    this.authStatusIsLoading = true;
    const isAuthenticated = await this.ssoService.isAuthenticatedAsync();
    this.authStatusIsLoading = false;

    // Load messages
    if (isAuthenticated) {
      this.fetchMessages();
    }

    return isAuthenticated;
  }

  public setTitle( ) {
    this.titleService.setTitle( StringConstants.app_Title );
  }
  /******** End Auth and Routing ********/

  /******** Notifications ********/
  private fetchMessages() {
    this.messageService.fetchUnreadMessages().then(messages => {
      this.showMessage(messages[0]);
    });
  }

  private showMessage(message: Message) {
    this.userAccessUpdatedMessage = message;
    this.delay(1).then(() => {
      $(`#userAccessMessageModal`).modal('show');
    });
  }

  userAccessUpdatedModalEmitted(event: boolean) {
    console.log(`Messages was respoded to, re-fetching`);
    this.fetchMessages();
  }
  /******** End Notifications ********/

  /**
   * Create a delay
   * @param ms milliseconds
   */
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /*
  private testAlerts() {
    this.delay(100).then(() => {
      this.alertService.show(`HELOO`, `one`, null);
      this.delay(100).then(() => {
        this.alertService.show(`HELOO`, `two`, null);
        this.delay(1000).then(() => {
          this.alertService.showConfirmation(`HELOO`, `three`);
        });
      });
      this.delay(1000).then(() => {
        this.alertService.show(`HELOO`, `three?`, null);
      });
      this.delay(1000).then(() => {
        this.alertService.showConfirmation(`HELOO`, `three??`);
      });
    });
    this.delay(1000).then(() => {
      this.alertService.show(`Hola`, `one?`, null);
    });
  }

  private testToasts() {
    this.delay(100).then(() => {
      this.toastService.show(`Your record has been commited to the InvasivesBC database.`, ToastIconType.success);
      this.toastService.show(`one`, ToastIconType.fail);
      this.delay(100).then(() => {
        this.toastService.show(`two`, ToastIconType.success);
        this.delay(1000).then(() => {
          this.toastService.show(`three`);
        });
      });
      this.delay(1000).then(() => {
        this.toastService.show(`four`, ToastIconType.none);
      });
      this.delay(1000).then(() => {
        this.toastService.show(`five`, ToastIconType.fail);
      });
    });
    this.delay(1000).then(() => {
      this.toastService.show(`six`, ToastIconType.success);
    });
  }
  */

}
