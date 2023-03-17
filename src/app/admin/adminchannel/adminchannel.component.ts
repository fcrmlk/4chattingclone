import { Component, OnInit, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { environment } from './../../../environments/environment';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-adminchannel',
  templateUrl: './adminchannel.component.html',
  styleUrls: ['./adminchannel.component.scss'],
})
export class AdminchannelComponent implements OnInit {
  @ViewChild('messageInput') messageInputRef: ElementRef;
  messages = new Array();
  item: Number = 0;
  currentdate: any;
  url: any;
  site: any;
  channelchats: any;
  channel_info: any;
  showSelected: boolean;
  constructor(private service: SitesettingsService, private route: ActivatedRoute,
    public toastr: ToastrService, private elem: ElementRef, private router: Router, private translate: TranslateService) {
    this.getchannelchats();
    this.getchannelinfo();
  }

  ngOnInit() {
    $.getScript('./assets/js/chat.js');
    window.scrollTo(0, document.querySelector('.chat-application').scrollHeight);
    const mydiv = $('#chat-application');
    mydiv.scrollTop(mydiv.prop('scrollHeight'));
    this.url = environment.API_URL;
  }

  getchannelchats() {
    this.route.params.subscribe(params => {
      this.service.getmychannelchats(params['id']).subscribe(res => {
        this.channelchats = res.result;
      });
    });
  }

  getchannelinfo() {
    this.route.params.subscribe(params => {
      this.service.getchannelinfo(params['id']).subscribe(res => {
        this.channel_info = res.result;
      });
    });
  }

  onAddMessage() {
    if (this.messageInputRef.nativeElement.value !== '') {
      const chats = {};
      const textmessages = {};
      const date = new Date();
      this.currentdate = date.toISOString();
      this.route.params.subscribe(params => {
        textmessages['textmsg'] = this.messageInputRef.nativeElement.value;
        textmessages['textmsgat'] = this.currentdate;
        textmessages['textmsgtype'] = 'text';
        this.messages.push(textmessages);
        chats['message'] = this.messageInputRef.nativeElement.value;
        chats['channel_id'] = params['id'];
        this.service.savechannelchats(chats).subscribe(data => {
          if (data.status) {
            // console.log('Saved');
          } else {
            // console.log('Not saved');
          }
        });
      });
    }
    this.messageInputRef.nativeElement.value = '';
    this.messageInputRef.nativeElement.focus();
  }


  uploadChannelUpload() {
    this.showSelected = true;
    const imagefiles = this.elem.nativeElement.querySelector('#channeluploads').files;
    const textmessages = {};
    const filetype = imagefiles[0].type;
    let msgType;
    if (filetype.indexOf('image') > -1 || filetype.indexOf('video') > -1 || filetype.indexOf('audio') > -1) {
      this.route.params.subscribe(params => {
        if (filetype.indexOf('video') > -1) {
          msgType = 'video';
        } else if (filetype.indexOf('audio') > -1) {
          msgType = 'audio';
        } else {
          msgType = 'image';
        }
        const fData: FormData = new FormData;
        const imagefile = imagefiles[0];
        fData.append('adminchannel_file', imagefile, imagefile.name);
        fData.append('type', msgType);
        fData.append('channel_id', params['id']);
        this.service.upfromadminchannel(fData).subscribe(data => {
          this.showSelected = false;
          if (data.status) {
            textmessages['textmsg'] = data.attachment;
            textmessages['textmsgat'] = data.message_at;
            textmessages['textmsgtype'] = data.message_type;
            this.messages.push(textmessages);
          } else {
            this.translate.get('Something went wrong').subscribe((res: string) => {
              this.toastr.error(res, '', { 'timeOut': 3000 });
            });
            return false;
          }
          this.elem.nativeElement.querySelector('#channeluploads').value = '';
        });
      });
    } else {
      this.showSelected = false;
      this.translate.get('Only Images / Videos / Audio are supported').subscribe((res: string) => {
        this.toastr.error(res, '', { 'timeOut': 3000 });
      });
      this.elem.nativeElement.querySelector('#channeluploads').value = '';
      return false;
    }
  }
}




