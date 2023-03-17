import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
    constructor(
        public toastr: ToastrService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService
    ) {
        this.translate.setDefaultLang('en');
    }

    switchLanguage(language: string) {

        this.translate.use(language);
    }

    onLogout() {
        if (confirm('Are you sure you want to log out?')) {
            this.authService.logout();
            this.translate.get('You have successfully logged out').subscribe((res: string) => {
                this.toastr.success(res, '', { 'timeOut': 3000 });
            });
            this.router.navigate(['/admin']);
            return false;
        }
    }
}
