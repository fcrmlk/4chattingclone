import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { SitesettingsService } from '../../services/sitesettings.service';
import { environment } from './../../../environments/environment';
const API_URL = environment.API_URL;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [NgbCarouselConfig] // add NgbCarouselConfig to the component providers
})
export class HomeComponent implements OnInit {
  sitebanner: any;
  allsitedata: any;
  sliders: any;
  url: any;
  constructor(private service: SitesettingsService, config: NgbCarouselConfig) {
    // customize default values of carousels used by this component tree
    config.interval = 2000;
    config.wrap = true;
    config.keyboard = false;
  }

  ngOnInit() {
    //  Code formatting script
    $.getScript('./assets/js/prism.min.js');
    this.url = API_URL;
    this.getsitedata();
  }

  getsitedata() {
    this.service.getsitedatasettings().subscribe(res => {
      this.sitebanner = API_URL + '/assets/public/banners/' + res.result.banner_image;
      this.allsitedata = res.result;
    });
  }

}






