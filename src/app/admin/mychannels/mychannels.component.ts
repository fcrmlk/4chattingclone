import { Component, OnInit} from "@angular/core";
import {Observable} from 'rxjs/Observable';
import { ToastrService } from "ngx-toastr";
import { SitesettingsService } from "../../services/sitesettings.service";
import { environment } from "./../../../environments/environment";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-mychannels",
  templateUrl: "./mychannels.component.html",
  styleUrls: ["./mychannels.component.scss"]
})
export class MychannelsComponent implements OnInit {
  allchannels: Observable<any>;
  allchannelscount: any;
  filter: any;
  filterValue: any;
  key: any = "_id";
  p: Number = 1;
  url: any;
  reverse: Boolean = false;
  constructor(
    public toastr: ToastrService,
    private service: SitesettingsService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.url = environment.API_URL;
    this.refreshList();
     this.adminchannelgetPage(1, '');
     this.filterValue = '';
  }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  removechannel(id) {
    this.service.removechannel(id).subscribe(data => {
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

  removechannelmessages(id) {
    this.service.removechannelmesssages(id).subscribe(data => {
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
   adminchannelapplyFilter(filterValue: string) {
    if(filterValue != "")
    {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.filterValue = filterValue;
    this.service.getadminchannellistobservefilter(filterValue).subscribe(res => {
      this.allchannels = res.result;
      this.allchannelscount = res.count;
      this.p=1;    });
    }else{
    this.adminchannelgetPage(1, '');
    }
  }


    adminchannelgetPage(page: number, filterValue: string) {
    if(filterValue == "")
    {
    this.service.getadminchannellistobserve(page).subscribe(res => {

      this.allchannels = res.result;
      this.allchannelscount = res.count;
      this.p=page;
     
    });
   }else{
    this.service.getadminchannellistobservefilterpage(page, filterValue).subscribe(res => {

      this.allchannels = res.result;
      this.allchannelscount = res.count;
      this.p=page;
      
    });
    }
   }

  refreshList() {
   
 this.adminchannelgetPage(1, '');
  }
}
