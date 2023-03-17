import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Http } from "@angular/http";
import { environment } from "../../environments/environment";

const API_URL = environment.API_URL + "/help";

@Injectable()
export class HelpService {
  constructor(private http: HttpClient, private https: Http) {}

  /* get help data */
  gethelpdatas(helptitle) {
    return this.https.get(API_URL + "/allhelps/" + helptitle).pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get terms data */
  gettermdatas(helptitle) {
    return this.https.get(API_URL + "/allterms/" + helptitle).pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* get help & terms data */
  gethelpterms() {
    return this.https.get(API_URL + "/allhelpterms/").pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* save help & terms data */
  addhelpterms(helpdata) {
    return this.https.post(API_URL + "/savehelpterms", helpdata).pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* edit help & terms data */
  edithelpterms(helpid) {
    return this.https.get(API_URL + "/gethelpterms/" + helpid).pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* update help & terms data */
  updatehelpterms(helpdata, id) {
    return this.https.post(API_URL + "/updatehelpterms/" + id, helpdata).pipe(
      map(res => {
        return res.json();
      })
    );
  }

  /* delete help & terms data */
  deletehelpterm(helpid) {
    return this.https.delete(API_URL + "/deletehelpterms/" + helpid).pipe(
      map(res => {
        return res.json();
      })
    );
  }
}
