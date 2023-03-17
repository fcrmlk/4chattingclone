import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule, Http } from '@angular/http';
import { AdminguardGuard } from './admin/adminguards/adminguard.guard';
import { PreventDoubleSubmitModule } from 'ngx-prevent-double-submission';
/* SERVICES */
import { AuthenticationService } from './services/authentication.service';
import { UserService } from './services/user.service';
import { HelpService } from './services/help.service';
import { SitesettingsService } from './services/sitesettings.service';
import * as $ from 'jquery';

/* TRANSLATIONS */
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/* JWT AUTHENTICATION */
import { JwtModule } from '@auth0/angular-jwt';
import { ViewuserComponent } from './viewuser/viewuser.component';

export function tokenGetter() {
    return localStorage.getItem('authtoken');
}

@NgModule({
    declarations: [
        AppComponent,
        ViewuserComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
        HttpClientModule,
        HttpModule,
        PreventDoubleSubmitModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 10000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
        }),
        NgbModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                whitelistedDomains: ['']
            }
        })
    ],
    providers: [
        AuthenticationService, AdminguardGuard, UserService, HelpService, SitesettingsService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
