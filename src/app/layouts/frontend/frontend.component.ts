import { Component, OnInit } from '@angular/core';
import { SitesettingsService } from '../../services/sitesettings.service';
import { environment } from './../../../environments/environment';
const API_URL = environment.API_URL;
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-frontend',
  templateUrl: './frontend.component.html',
  styleUrls: ['./frontend.component.scss']
})

export class FrontendComponent implements OnInit {
  sitedata: any;
  constructor(private meta: Meta, private service: SitesettingsService) {
    this.service.getsitedatasettings().subscribe(res => {
      this.sitedata = res.result;
      /* General meta */
      this.meta.updateTag({ name: 'keywords', content: this.sitedata.meta_keywords });
      this.meta.updateTag({ name: 'description', content: this.sitedata.meta_description });
      /* Facebook meta */
      this.meta.updateTag({ property: 'og:site_name', content: this.sitedata.site_title });
      this.meta.updateTag({ property: 'og:title', content: this.sitedata.meta_title });
      this.meta.updateTag({ property: 'og:description', content: this.sitedata.meta_description });
      this.meta.updateTag({ property: 'og:url', content: this.sitedata.meta_url });
      this.meta.updateTag({ property: 'og:image', content: API_URL + '/assets/public/seo/' + this.sitedata.meta_image });
      /* Twitter meta */
      this.meta.updateTag({ name: 'twitter:title', content: this.sitedata.meta_title });
      this.meta.updateTag({ name: 'twitter:description', content: this.sitedata.meta_description });
      this.meta.updateTag({ name: 'twitter:card', content: this.sitedata.meta_url });
      this.meta.updateTag({ name: 'twitter:site', content: API_URL + '/assets/public/seo/' + this.sitedata.meta_image });
      /* Google + meta */
      this.meta.updateTag({ itemprop: 'name', content: this.sitedata.meta_title });
      this.meta.updateTag({ itemprop: 'description', content: this.sitedata.meta_description });

    });
  }

  ngOnInit() {
  }

}
