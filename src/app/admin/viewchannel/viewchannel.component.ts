import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-viewchannel',
  templateUrl: './viewchannel.component.html',
  styleUrls: ['./viewchannel.component.scss']
})
export class ViewchannelComponent implements OnInit {

   userchannel_info: any;
   user_info: any;
   userchannelreport_info: any;
  filter: any;
  key: any = '_id';
  reverse: Boolean = false;
  p: Number = 1;
  url: any;
  keys: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,

  ) {
   this.getuserchannelinfo();
  this.getuserchannelreportinfo();
 
  }

  ngOnInit() {

    this.url = environment.API_URL;
    
   
  }

    getuserchannelinfo() {
    this.route.params.subscribe(params => {
      this.user.getuserchannelinfo(params['id']).subscribe(res => {
        this.userchannel_info = res.result;

        var channelinfo_arr = [["Type", "Count", { role: "style" } ],
        ["Text", this.userchannel_info.channel_text_count, "#009DA0"],
        ["Image", this.userchannel_info.channel_image_count, "#009DA0"],
        ["Audio", this.userchannel_info.channel_audio_count, "#009DA0"],
        ["Video", this.userchannel_info.channel_video_count, "#009DA0"],
        ["Files", this.userchannel_info.channel_file_count, "#009DA0"],
        ["Location", this.userchannel_info.channel_location_count, "#009DA0"],
        ["Contact", this.userchannel_info.channel_contact_count, "#009DA0"]];

           this.user.getchanneladmininfo(this.userchannel_info.channel_admin_id).subscribe(res => {
      
            this.user_info = res.result;
        });

    google.charts.load("current", {packages:['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
 
      var data = google.visualization.arrayToDataTable(channelinfo_arr);
      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" },
                       2]);
      var options = {
      title: '',
       colors: ["#009DA0"],
  
      };

      var columnchart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
      columnchart.draw(view, options);
  }

     });
    });
  }


     
     
    


     getuserchannelreportinfo() {
    this.route.params.subscribe(params => {
      this.user.getuserchannelreportinfo(params['id']).subscribe(res => {
      
        var reporttypes = [];
          for (let i = 0; i < res.result.length; i++) {

              reporttypes.push(res.result[i].report);
          }
        
    this.userchannelreport_info = reporttypes.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
    this.keys = Object.keys(this.userchannelreport_info);

    
     });
    });
  }

 






}
