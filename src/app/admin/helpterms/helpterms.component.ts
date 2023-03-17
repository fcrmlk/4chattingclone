import { Component, OnInit } from "@angular/core";
import { HelpService } from "../../services/help.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-helpterms",
  templateUrl: "./helpterms.component.html",
  styleUrls: ["./helpterms.component.scss"]
})
export class HelptermsComponent implements OnInit {
  allhelps: any;
  allhelpscount: any;
  filter: any;
  key: any = "_id";
  p: Number = 1;
  reverse: Boolean = false;
  constructor(
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private help: HelpService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.refreshList();
  }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  removehelpterm(id) {
    this.help.deletehelpterm(id).subscribe(data => {
      if (data.status) {
        this.translate.get(data.message).subscribe((res: string) => {
          this.toastr.success(res, "", { timeOut: 3000 });
        });
        window.scrollTo(0, 0);
        this.refreshList();
      } else {
        window.scrollTo(0, 0);
        this.translate.get(data.message).subscribe((res: string) => {
          this.toastr.error(res, "", { timeOut: 3000 });
        });
      }
    });
  }
  refreshList() {
    this.help.gethelpterms().subscribe(res => {
      this.allhelpscount = res.count;
      this.allhelps = res.result;
    });
  }
}
