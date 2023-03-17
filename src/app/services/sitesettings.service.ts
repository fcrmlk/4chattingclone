import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
interface IServerResponse {
    result: Observable<any>;
    count: number;
    check: number;
}

const API_URL = environment.API_URL + '/admin';

@Injectable()
export class SitesettingsService {

  constructor(private http: HttpClient, private https: Http) { }

  /* save banners */
  uploadBanners(formData: any) {
    return this.https.post(API_URL + '/savebanners', formData).pipe(
      map(res => {
        return res.json();
      }));
  }


  /* save banners */
  uploadLogos(formData: any) {
    return this.https.post(API_URL + '/savelogos', formData).pipe(
      map(res => {
        return res.json();
      }));
  }


  /* save sliders */
  uploadSliders(formData: any) {
    return this.https.post(API_URL + '/savesliders', formData).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save metaimage */
  uploadMetaimage(formData: any) {
    return this.https.post(API_URL + '/savemetaimage', formData).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save metaimage */
  newAdminChannel(formData: any) {
    return this.https.post(API_URL + '/savenewchannel', formData).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get sitesettings */
  getsitesettings() {
    return this.https.get(API_URL + '/sitesettings').pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get sitesettings */
  getsitedatasettings() {
    return this.https.get(API_URL + '/sitedatasettings').pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get sitesettings */
  getadminsettings() {
    return this.https.get(API_URL + '/adminsettings').pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save sitesettings */
  savesitesettings(sitedata) {
    return this.https.post(API_URL + '/savesitedata', sitedata).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save adminsettings */
  saveadminsettings(admindata) {
    return this.https.post(API_URL + '/saveprofile', admindata).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* delete slider image  */
  deleteslider(sliderimage) {
    return this.https.delete(API_URL + '/deleteslider/' + sliderimage).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save certificates */
  uploadapns(formData: any) {
    return this.https.post(API_URL + '/saveapns', formData).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save key */
  uploadvoipkey(formData: any) {
    return this.https.post(API_URL + '/savevoipkey', formData).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get my channel chats */
  getmychannelchats(id) {
    return this.https.get(API_URL + '/mychannelchats/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get my channel info */
  getchannelinfo(id) {
    return this.https.get(API_URL + '/mychannelinfo/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save channel messages */
  savechannelchats(channelchats) {
    return this.https.post(API_URL + '/savechannelmessages', channelchats).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* get admin channels */
  getadminchannellist() {
    return this.https.get(API_URL + '/adminchannellist').pipe(
      map(res => {
        return res.json();
      }));
  }


     /* get alladmin channel list filter observer*/
  getadminchannellistobservefilter(filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getadminchannellistobservefilter/"+ filterValue).pipe(
      map(res => {  
      console.log(filterValue);
        console.log(res);      
         return res.json();
      })
    );
  }

    /* get admin channel list observer*/
  getadminchannellistobserve(page: number): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getadminchannellistobserve/"+ page).pipe(
      map(res => {
         return res.json();
      })
    );
  }

     /* get adminchannel list observer*/ 
  getadminchannellistobservefilterpage(page: number, filterValue: string): Observable<IServerResponse> {
    return this.https.get(API_URL + "/getadminchannellistobservefilterpage/"+ page + "/" + filterValue).pipe(
      map(res => {
      //console.log(filterValue);
        // console.log(res);
         return res.json();
      })
    );
  }

  /* remove channels */
  removechannel(id) {
    return this.https.delete(API_URL + '/deletechannel/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save new channel*/
  addnewchannel(helpdata) {
    return this.https.post(API_URL + '/savenewchannel', helpdata).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* save key */
  upfromadminchannel(formData: any) {
    return this.https.post(API_URL + '/uploadadminchannel', formData).pipe(
      map(res => {
        return res.json();
      }));
  }

  /* remove channel's messages */
  removechannelmesssages(id) {
    return this.https.delete(API_URL + '/deletechannelmessages/' + id).pipe(
      map(res => {
        return res.json();
      }));
  }



}
