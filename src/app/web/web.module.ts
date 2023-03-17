import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebRoutingModule } from './web-routing.module';
import { HomeComponent } from './home/home.component';
import { HelpComponent } from './help/help.component';
import { TosComponent } from './tos/tos.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

/* REMOVE HTML TAGS */
import { EscapeHtmlPipe } from '../shared/pipes/keep-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    WebRoutingModule,
    NgbModule,
    TranslateModule
  ],
  declarations: [HomeComponent, HelpComponent, TosComponent, EscapeHtmlPipe]
})
export class WebModule { }
