import { Component, OnInit } from '@angular/core';
import { ROUTES } from './sidebar-routes.config';
import { Router, ActivatedRoute } from '@angular/router';
import { SitesettingsService } from '../../services/sitesettings.service';
import { environment } from './../../../environments/environment';
import { AuthenticationService } from '../../services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

declare var $: any;

const API_URL = environment.API_URL;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    site_title: String;
    sitelogo: String;
    constructor(private router: Router,
        private route: ActivatedRoute, private service: SitesettingsService, private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit() {
        $.getScript('./assets/js/app-sidebar.js');
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        this.getsitedata();
    }

    getsitedata() {
        this.service.getsitedatasettings().subscribe(res => {
            this.site_title = res.result.site_title;
            this.sitelogo = API_URL + '/assets/public/logos/' + res.result.logo;
        });
    }

    /* NGX Wizard - skip url change */
    ngxWizardFunction(path: string) {
        if (path.indexOf('forms/ngx') !== -1) {
            this.router.navigate(['forms/ngx/wizard'], { skipLocationChange: false });
        }
    }

    onLogout() {
        if (confirm('Are you sure you want to log out?')) {
            this.authService.logout();
            this.router.navigate(['/admin']);
            return false;
        }
    }
}
