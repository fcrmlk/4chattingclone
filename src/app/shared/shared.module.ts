import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleFullscreenDirective } from './directives/toggle-fullscreen.directive';
import { FrontheaderComponent } from './frontheader/frontheader.component';
import { FrontfooterComponent } from './frontfooter/frontfooter.component';
import { FileuploadDirective } from './directives/fileupload.directive';
import { ValidatepasswordDirective } from './directives/validatepassword.directive';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    exports: [
        CommonModule,
        FooterComponent,
        NavbarComponent,
        SidebarComponent,
        FrontheaderComponent,
        FrontfooterComponent,
        ToggleFullscreenDirective,
        NgbModule,
        FileuploadDirective,
        ValidatepasswordDirective
    ],
    imports: [
        RouterModule,
        CommonModule,
        NgbModule,
        TranslateModule
    ],
    declarations: [
        FooterComponent,
        NavbarComponent,
        SidebarComponent,
        ToggleFullscreenDirective,
        FrontheaderComponent,
        FrontfooterComponent,
        FileuploadDirective,
        ValidatepasswordDirective
    ]
})
export class SharedModule { }
