import { Component, OnInit } from "@angular/core";
import {Observable} from 'rxjs/Observable';
import { UserService } from "../../services/user.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { environment } from './../../../environments/environment';
@Component({
  selector: 'app-blockedchannels',
  templateUrl: './blockedchannels.component.html',
  styleUrls: ['./blockedchannels.component.scss']
})
export class BlockedchannelsComponent implements OnInit {
  totalusers: Observable<any>;
  totaluserscount: any;
  filter: any;
  filterValue: any;
  key: any = "_id";
  reverse: Boolean = false;
  p: Number = 1;
  url: any;
  channelinfo: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
    private translate: TranslateService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.url = environment.API_URL;
    this.refreshList();
    this.getblockedchanelPage(1, '');
    this.filterValue = '';
  }


   blockedchannelapplyFilter(filterValue: string) {
    if(filterValue != "")
    {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.filterValue = filterValue;
    this.user.getblockedchannellistobservefilter(filterValue).subscribe(res => {
      this.totalusers = res.result;
      this.totaluserscount = res.count;
      this.p=1;

    });
    }else{
    this.getblockedchanelPage(1, '');
    }
  }


    getblockedchanelPage(page: number, filterValue: string) {
    if(filterValue == "")
    {
    this.user.getblockedchannellistobserve(page).subscribe(res => {

      this.totalusers = res.result;
      this.totaluserscount = res.count;
      this.p=page;
     
    });
   }else{
    this.user.getblockedchannellistobservefilterpage(page, filterValue).subscribe(res => {

      this.totalusers = res.result;
      this.totaluserscount = res.count;
      this.p=page;
     
    });
    }
   }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  managechannel(id) {
    this.user.channelmanagement(id).subscribe(data => {
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
   this.getblockedchanelPage(1, '');
  }
}
