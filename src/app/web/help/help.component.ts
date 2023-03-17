import { Component, OnInit } from "@angular/core";
import { HelpService } from "../../services/help.service";
import { ToastrService } from "ngx-toastr";
import { SitesettingsService } from "../../services/sitesettings.service";
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from './../../../environments/environment';
const API_URL = environment.API_URL;
@Component({
  selector: "app-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.scss"]
})
export class HelpComponent implements OnInit {
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.url = API_URL;
    this.route.params.subscribe(params => {
      this.help.gethelpdatas(params["content"]).subscribe(res => {
        this.selectedHelp = res.totalhelps[res.selectedTitle]._id;
        this.selectedHelptitle = res.selectedTitle;
        this.helpcount = res.noofhelps;
        this.helptitledatas = res.totalhelps;
        this.helpdatas = res.totalhelps[res.selectedTitle];
        this.termdatas = res.totalterms;
        this.termcount = this.termdatas.length;

      });
    });
    this.siteservice.getsitedatasettings().subscribe(res => {
      this.allsitedata = res.result;
    });
  }
}
