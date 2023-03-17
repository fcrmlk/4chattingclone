import { Component, OnInit, HostBinding } from '@angular/core';
import { SitesettingsService } from '../../services/sitesettings.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
    allsitedata: any;
    constructor(private service: SitesettingsService) {
    }

    ngOnInit() {
        $.getScript('./assets/js/prism.min.js');
        this.getsitedata();
    }

    getsitedata() {
        this.service.getsitedatasettings().subscribe(res => {
            this.allsitedata = res.result;
        });
    }
}
