import { Component, OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"]
})
export class ReportsComponent implements OnInit {
  totalusers: any;
  totaluserscount: any;
  filter: any;
  key: any = "_id";
  reverse: Boolean = false;
  p: Number = 1;
  url: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
    private translate: TranslateService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.user.getviewreports(params["id"]).subscribe(res => {
        this.totalusers = res.result;
        this.totaluserscount = res.count;
      });
    });
  }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  ignorethisreport(id) {
    this.user.reportmanagement(id).subscribe(data => {
      if (data.status) {
        this.translate.get(data.message).subscribe((res: string) => {
          this.toastr.success(res, "", { timeOut: 3000 });
        });
        window.scrollTo(0, 0);
        this.route.params.subscribe(params => {
          this.user.getviewreports(params["id"]).subscribe(res => {
            this.totalusers = res.result;
            this.totaluserscount = res.count;
          });
        });
      } else {
        window.scrollTo(0, 0);
        this.translate.get(data.message).subscribe((res: string) => {
          this.toastr.error(res, "", { timeOut: 3000 });
        });
      }
    });
  }
}
