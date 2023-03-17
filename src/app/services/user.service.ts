import { Observable } from 'rxjs/Observable';
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Http, Headers } from "@angular/http";
import { environment } from "../../environments/environment";

interface IServerResponse {
    result: Observable<any>;
    count: number;
    check: number;
}

const API_URL = environment.API_URL + "/user";

@Injectable()
export class UserService {
  constructor(private http: HttpClient, private https: Http) {}

  /* total no of users */
  getusertotal() {
    return this.https.get(API_URL + "/usercount/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get user info */

     getuserinfo(id) {
    return this.https.get(API_URL + '/userinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }


  /* get channel admin info */

     getchanneladmininfo(id) {

    return this.https.get(API_URL + '/getchanneladmininfo/' + id).pipe(
      map(res => {
        return res.json();
       
      }));
  }




    /* get channel info */

     getuserchannelinfo(id) {
    return this.https.get(API_URL + '/userchannelinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }

      /* get channel report info */

     getuserchannelreportinfo(id) {
    return this.https.get(API_URL + '/userchannelreportinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }


  

  /* get user list */
  getuserlist() {
    return this.https.get(API_URL + "/getallusers/").pipe(
      map(res => {
        return res.json();
      })
    );
  }


  /* get user list observer*/
  getuserlistobserve(page: number): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getallusersobserve/"+ page).pipe(
      map(res => {
         return res.json();
      })
    );
  }


   /* get all user list observer*/ 
  getuserlistobservefilterpage(page: number, filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getuserlistobservefilterpage/"+ page + "/" + filterValue).pipe(
      map(res => {
      //console.log(filterValue);
        // console.log(res);
         return res.json();
      })
    );
  }

      /* get all user list filter observer*/
  getuserlistobservefilter(filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getuserlistobservefilter/"+ filterValue).pipe(
      map(res => {  
       
         return res.json();
      })
    );
  }


  /* get own channels list */

     getownchannelsinfo(id) {
    return this.https.get(API_URL + '/ownchannelsinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get reported channels list */

     getreportedchannelsinfo(id) {
    return this.https.get(API_URL + '/reportedchannelsinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }
    /* get subscribed channels list */

     getsubscribedchannelsinfo(id) {
    return this.https.get(API_URL + '/subscribedchannelsinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }


    /* get user group list */

     getusergroup(id) {
    return this.https.get(API_URL + '/usergroupinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }


    /* get user contacts list */

     getusercontacts(id) {
    return this.https.get(API_URL + '/getusercontacts/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }



    /* get user recent calls list */

     getuserrecentcalls(id) {
    return this.https.get(API_URL + '/userrecentcallsinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }



  /* get active user channels list */
  getuserchannelslist() {
    return this.https.get(API_URL + "/getuserchannels/").pipe(
      map(res => {
        return res.json();
      })
    );
  }



     /* get active channel list filter observer*/
  getactivechannellistobservefilter(filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getactivechannellistobservefilter/"+ filterValue).pipe(
      map(res => {  
         
         return res.json();
      })
    );
  }

    /* get active channel list observer*/
  getactivechannellistobserve(page: number): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getactivechannellistobserve/"+ page).pipe(
      map(res => {
         return res.json();
      })
    );
  }

     /* get adminchannel list observer*/ 
  getactivechannellistobservefilterpage(page: number, filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getactivechannellistobservefilterpage/"+ page + "/" + filterValue).pipe(
      map(res => {

         return res.json();
      })
    );
  }



     /* get blocked channel list filter observer*/
  getblockedchannellistobservefilter(filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getblockedchannellistobservefilter/"+ filterValue).pipe(
      map(res => {  
     
         return res.json();
      })
    );
  }

    /* get active channel list observer*/
  getblockedchannellistobserve(page: number): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getblockedchannellistobserve/"+ page).pipe(
      map(res => {
         return res.json();
      })
    );
  }

     /* get adminchannel list observer*/ 
  getblockedchannellistobservefilterpage(page: number, filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getblockedchannellistobservefilterpage/"+ page + "/" + filterValue).pipe(
      map(res => {
      //console.log(filterValue);
        // console.log(res);
         return res.json();
      })
    );
  }



 

    /* block channels */
  blockchannel(id) {
    return this.https.delete(API_URL + '/blockchannel/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }

    /* get blocked user channels list */
  getblockedchannelslist() {
    return this.https.get(API_URL + "/getblockedchannels/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get groups list */
  getgrouplist() {
    return this.https.get(API_URL + "/getallgroups/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get recent users list */
  getusercountrylist() {
    return this.https.get(API_URL + "/getuserscountry/").pipe(
      map(res => {
        return res.json();
      })
    );
  }
  /* get users' country */
  getrecentuserlist() {
    return this.https.get(API_URL + "/getrecentusers/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get recent groups list */
  getrecentgrouplist() {
    return this.https.get(API_URL + "/getrecentgroups/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get platform users list */
  getplatformusers() {
    return this.https.get(API_URL + "/getplatformlist/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get public channels list */
  getpublicchannelslist() {
    return this.https.get(API_URL + "/getpublicchannels/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

    /* get online users list */
  getonlineusers() {
    return this.https.get(API_URL + "/getonlineusers/").pipe(
      map(res => {
        return res.json();
      })
    );
  }
     /* get online users list */
  getstatuscount() {
    return this.https.get(API_URL + "/getstatuscount/").pipe(
      map(res => {
        return res.json();
      })
    );
  }




    /* get all channels list */
  gettotalchannelslist() {
    return this.https.get(API_URL + "/gettotalchannels/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get platform users list */
  getprivatechannelslist() {
    return this.https.get(API_URL + "/getprivatechannels/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get by this month */
  getcountbythismonth() {
    return this.https.get(API_URL + "/getmonthlist/").pipe(
      map(res => {
        return res.json();
      })
    );
  }
    /* get by today */
  getcountbytoday() {
    return this.https.get(API_URL + "/gettodaylist/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

    /* get by this year */
  getcountbythisyear() {
    return this.https.get(API_URL + "/getyearlist/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get reports */
  getviewreports(id) {
    return this.https.get(API_URL + "/channelreports/" + id).pipe(
      map(res => {
        return res.json();
      })
    );
  }

    /* get by today */
  getsharedmediacount() {
    return this.https.get(API_URL + "/getsharedmedia/").pipe(
      map(res => {
        return res.json();
      })
    );
  }


      /* get recent days status count */
  getstatusmediacount() {
    return this.https.get(API_URL + "/getstatusmedia/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* manage channel */
  channelmanagement(id) {
    return this.https.delete(API_URL + "/blockit/" + id).pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* manage report */
  reportmanagement(id) {
    return this.https.delete(API_URL + "/deletereport/" + id).pipe(
      map(res => {
        return res.json();
      })
    );
  }
}
