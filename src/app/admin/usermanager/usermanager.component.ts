import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';

import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-usermanager',
  templateUrl: './usermanager.component.html',
  styleUrls: ['./usermanager.component.scss']
})

export class UsermanagerComponent implements OnInit {
   totalusers: Observable<any>;
  totaluserscount: any;
  filter: any;
  filterValue: any;
  key: any = '_id';
  reverse: Boolean = false;
  p: Number = 1;
  url: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
  ) {

  }

  ngOnInit() {
    this.url = environment.API_URL;
    this.getPage(1, '');
    this.filterValue = '';
  }

   applyFilter(filterValue: string) {
    if(filterValue != "")
    {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.filterValue = filterValue;
    this.user.getuserlistobservefilter(filterValue).subscribe(res => {
      this.totalusers = res.result;
      this.totaluserscount = res.count;
      this.p=1;

    });
    }else{
    this.getPage(1, '');
    }
  }


    getPage(page: number, filterValue: string) {
    if(filterValue == "")
    {
    this.user.getuserlistobserve(page).subscribe(res => {

      this.totalusers = res.result;
      this.totaluserscount = res.count;
      this.p=page;
      
    });
   }else{
    this.user.getuserlistobservefilterpage(page, filterValue).subscribe(res => {

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
}
