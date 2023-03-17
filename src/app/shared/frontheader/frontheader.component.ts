import { Component, OnInit } from '@angular/core';
import { SitesettingsService } from '../../services/sitesettings.service';
import { environment } from './../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

const API_URL = environment.API_URL;

@Component({
  selector: 'app-frontheader',
  templateUrl: './frontheader.component.html',
  styleUrls: ['./frontheader.component.scss']
})
export class FrontheaderComponent implements OnInit {
  sitelogo: any;
  textDir: any;
    url: any;
  constructor(private service: SitesettingsService, private translate: TranslateService) { }

  ngOnInit() {
   this.url = API_URL;
    this.getsitedata();
  }

  getsitedata() {
    this.service.getsitesettings().subscribe(res => {
      this.sitelogo = API_URL + '/assets/public/logos/' + res.result[0].logo;
    });
  }
    switchLanguage(language: string) {
        this.translate.use(language);
        
     if(language == 'ar')
      {
        this.textDir = 'rtl';
        document.body.setAttribute("dir", "rtl");
      } 
      else
      {
        this.textDir = 'ltr';
          document.body.setAttribute("dir", "ltr");
      }

       
    }

}
