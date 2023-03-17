import { Component, OnInit } from "@angular/core";
import { HelpService } from "../../services/help.service";
import { ToastrService } from "ngx-toastr";
import { SitesettingsService } from "../../services/sitesettings.service";
import { TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from './../../../environments/environment';
const API_URL = environment.API_URL;
@Component({
  selector: "app-tos",
  templateUrl: "./tos.component.html",
  styleUrls: ["./tos.component.scss"]
})
export class TosComponent implements OnInit {
  helpdatas: any;
  helptitledatas: any;
  helpcount: any;
  termdatas: any;
  termcount: any;
  allsitedata: any;
  selectedHelp: any;
  selectedHelptitle: any;
  isCollapsed = true;
  url: any;

  constructor(
    public toastr: ToastrService,
    private help: HelpService,
    private siteservice: SitesettingsService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.url = API_URL;
    this.route.params.subscribe(params => {
      this.help.gettermdatas(params["content"]).subscribe(res => {
        this.selectedHelp = res.totalterms[res.selectedTitle]._id;
        this.selectedHelptitle = res.selectedTitle;
        this.helpcount = res.noofhelps;
        this.helptitledatas = res.totalhelps;
        this.helpdatas = res.totalterms[res.selectedTitle];
        this.termcount = res.noofterms;
        this.termdatas = res.totalterms;
      });
    });

    this.siteservice.getsitedatasettings().subscribe(res => {
      this.allsitedata = res.result;
    });
  }
}
