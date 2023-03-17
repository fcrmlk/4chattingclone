import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers } from '@angular/http';
import { HttpClient } from '@angular/common/http';

/* JWT AUTHENTICATION */
import { JwtHelperService } from '@auth0/angular-jwt'

const API_URL = environment.API_URL + '/admin';

@Injectable()
export class AuthenticationService {
  admindata: any;
  authToken: any;
  userdata: any;
  helper: any;
  constructor(private http: Http, private https: HttpClient, private jwtHelperService: JwtHelperService) {
  }
  /* authenticate admin */
  authenticateAdmin(admindata) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(API_URL + '/authenticateadmin', admindata, { headers: headers }).pipe(
      map(res => res.json()));
  }

  /* store userdata after successful authentication */
  storeUserData(token, userdata) {
    localStorage.setItem('authtoken', token);
    localStorage.setItem('user', JSON.stringify(userdata));
    this.authToken = token;
    this.userdata = userdata;
  }

  /* checking jwt token expiration */
  loggedIn() {
    const token: string = this.jwtHelperService.tokenGetter();
    if (!token) {
      return false
    }
    const tokenExpired: boolean = this.jwtHelperService.isTokenExpired(token);
    return !tokenExpired;
  }

  /* clear the userdata & logout user */
  logout() {
    this.authToken = null;
    this.userdata = null;
    localStorage.clear();
  }

}

