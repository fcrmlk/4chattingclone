import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { FullLayoutComponent } from ".././layouts/full/full-layout.component";
import { ContentLayoutComponent } from ".././layouts/content/content-layout.component";

import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { HelptermsComponent } from "./helpterms/helpterms.component";
import { NewhelptermsComponent } from "./newhelpterms/newhelpterms.component";
import { EdithelptermsComponent } from "./edithelpterms/edithelpterms.component";
import { BannersComponent } from "./banners/banners.component";
import { UsermanagerComponent } from "./usermanager/usermanager.component";
import { GeneralsettingsComponent } from "./generalsettings/generalsettings.component";
import { SeosettingsComponent } from "./seosettings/seosettings.component";
import { NotificationsetingsComponent } from "./notificationsetings/notificationsetings.component";
import { ProfileComponent } from "./profile/profile.component";
import { AdminchannelComponent } from "./adminchannel/adminchannel.component";
import { MychannelsComponent } from "./mychannels/mychannels.component";
import { NewadminchannelComponent } from "./newadminchannel/newadminchannel.component";
import { UserchannelsComponent } from "./userchannels/userchannels.component";
import { BlockedchannelsComponent } from "./blockedchannels/blockedchannels.component";
import { AppsettingsComponent } from "./appsettings/appsettings.component";
import { ReportsComponent } from "./reports/reports.component";
import { ViewuserComponent } from "./viewuser/viewuser.component";
import { ViewchannelComponent } from "./viewchannel/viewchannel.component";
import { SharedModule } from ".././shared/shared.module";

/* authentication guards */
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";
import { AdminguardGuard } from "./adminguards/adminguard.guard";

const routes: Routes = [
  {
    path: "",
    component: ContentLayoutComponent,
    children: [{ path: "", component: LoginComponent }]
  },
  {
    path: "",
    component: FullLayoutComponent,
    canActivate: [AdminguardGuard],
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "usermanager", component: UsermanagerComponent },
      { path: "helpterms", component: HelptermsComponent },
      { path: "newhelpterms", component: NewhelptermsComponent },
      { path: "edithelpterms/:id", component: EdithelptermsComponent },
      { path: "banners", component: BannersComponent },
      { path: "generalsettings", component: GeneralsettingsComponent },
      { path: "notificationmanager", component: NotificationsetingsComponent },
      { path: "seomanager", component: SeosettingsComponent },
      { path: "profile", component: ProfileComponent },
      { path: "channelmanager", component: MychannelsComponent },
      { path: "messagetochannel/:id", component: AdminchannelComponent },
      { path: "viewuser/:id", component: ViewuserComponent },
      { path: "viewchannel/:id", component: ViewchannelComponent },
      { path: "newadminchannel", component: NewadminchannelComponent },
      { path: "newadminchannel", component: NewadminchannelComponent },
      { path: "userchannels", component: UserchannelsComponent },
      { path: "blockedchannels", component: BlockedchannelsComponent },
      { path: "appsettings", component: AppsettingsComponent },
      { path: "viewreports/:id", component: ReportsComponent },
      { path: "**", component: DashboardComponent },
    
    ]
  }
];

@NgModule({
  declarations: [ContentLayoutComponent, FullLayoutComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    HttpModule,
    HttpClientModule
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
