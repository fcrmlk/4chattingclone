import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AdminRoutingModule } from "./admin-routing.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatchHeightModule } from "../shared/directives/match-height.directive";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

import { Ng2SearchPipeModule } from "ng2-search-filter"; // importing the module
import { Ng2OrderModule } from "ng2-order-pipe"; // importing the module
import { NgxPaginationModule } from "ngx-pagination";
import { QuillModule } from "ngx-quill";

/* VIDEO & AUDIO */
import { VgCoreModule } from "videogular2/core";
import { VgControlsModule } from "videogular2/controls";
import { VgOverlayPlayModule } from "videogular2/overlay-play";
import { VgBufferingModule } from "videogular2/buffering";

import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsermanagerComponent } from "./usermanager/usermanager.component";
import { HelptermsComponent } from "./helpterms/helpterms.component";
import { NewhelptermsComponent } from "./newhelpterms/newhelpterms.component";
import { EdithelptermsComponent } from "./edithelpterms/edithelpterms.component";
import { BannersComponent } from "./banners/banners.component";
import { GeneralsettingsComponent } from "./generalsettings/generalsettings.component";
import { SeosettingsComponent } from "./seosettings/seosettings.component";
import { NotificationsetingsComponent } from "./notificationsetings/notificationsetings.component";
import { ProfileComponent } from "./profile/profile.component";
import { AdminchannelComponent } from "./adminchannel/adminchannel.component";
import { MychannelsComponent } from "./mychannels/mychannels.component";
import { NewadminchannelComponent } from "./newadminchannel/newadminchannel.component";
import { UserchannelsComponent } from "./userchannels/userchannels.component";
import { AppsettingsComponent } from "./appsettings/appsettings.component";
import { ReportsComponent } from "./reports/reports.component";
import { GoogleChartsModule } from 'angular-google-charts';





/* CHARTS */
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { ChartsModule } from "ng2-charts";
import { ViewuserComponent } from './viewuser/viewuser.component';
import { BlockedchannelsComponent } from './blockedchannels/blockedchannels.component';
import { ViewchannelComponent } from './viewchannel/viewchannel.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule.forRoot(),
    MatchHeightModule,
    ReactiveFormsModule,
    FormsModule,
    Ng2SearchPipeModule, // including into imports
    Ng2OrderModule, // importing the sorting package here
    NgxPaginationModule,
    QuillModule,
    TranslateModule,
    NgxChartsModule,
    ChartsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    GoogleChartsModule.forRoot('AIzaSyBqN_3wtob65prYXsWPGtvaMNzntAzpnes'),
  ],
  exports: [],
  declarations: [
    LoginComponent,
    DashboardComponent,
    UsermanagerComponent,
    HelptermsComponent,
    NewhelptermsComponent,
    EdithelptermsComponent,
    BannersComponent,
    GeneralsettingsComponent,
    SeosettingsComponent,
    NotificationsetingsComponent,
    ProfileComponent,
    AdminchannelComponent,
    MychannelsComponent,
    NewadminchannelComponent,
    UserchannelsComponent,
    AppsettingsComponent,
    ReportsComponent,
    ViewuserComponent,
    BlockedchannelsComponent,
    ViewchannelComponent,
 
  ],
  providers: []
})
export class AdminModule {}
