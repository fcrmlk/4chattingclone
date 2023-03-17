import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { HelpComponent } from "./help/help.component";
import { TosComponent } from "./tos/tos.component";

import { FrontendComponent } from "../layouts/frontend/frontend.component";
import { SharedModule } from ".././shared/shared.module";

import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";

const routes: Routes = [
  {
    path: "",
    component: FrontendComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "help", component: HelpComponent },
      { path: "terms", component: TosComponent },
      { path: "help/:content", component: HelpComponent },
      { path: "terms/:content", component: TosComponent }
    ]
  }
];

@NgModule({
  declarations: [FrontendComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    HttpModule,
    HttpClientModule
  ],
  exports: [RouterModule]
})
export class WebRoutingModule {}
