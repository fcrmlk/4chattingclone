import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';
import * as chartsData from '../../shared/data/chartjs';
@Component({
  selector: 'app-viewuser',
  templateUrl: './viewuser.component.html',
  styleUrls: ['./viewuser.component.scss']
})
export class ViewuserComponent implements OnInit {
  userrecentcalls_info: any;
  user_info: any;
  ownchannels_info: any;
  reportedchannels_info: any;
  subscribedchannels_info: any;
  subscribedchannels_count: any;
  reportedchannels: any;
  usergroup_info: any;
  usergroupcount: any;
  usercontactscount: any;
  filter: any;
  key: any = '_id';
  reverse: Boolean = false;
  p: Number = 1;
  url: any;
  doughnutChartLabels: string[] = ['Images', 'Video'];
  doughnutChartData: number[];
  public doughnutChartType = chartsData.doughnutChartType;
  public doughnutChartColors = chartsData.doughnutChartColors;
  public doughnutChartOptions = chartsData.doughnutChartOptions;

  // Pie
  public pieChartLabels: string[] = ['Audio', 'Video'];
  public pieChartData: number[];
  public pieChartType = chartsData.pieChartType;
  public pieChartColors = chartsData.pieChartColors;
  public pieChartOptions = chartsData.pieChartOptions;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
  ) {
   this.getuserinfo();
   this.getownchannels();
   this.getreportedchannels();
   this.getsubscribedchannels();
   this.usergroup();
   this.usercontacts();
  }

  ngOnInit() {

    this.url = environment.API_URL;
    this.doughnutChartData = [];
    this.pieChartData = [];
  }

    getuserinfo() {
    this.route.params.subscribe(params => {
      this.user.getuserinfo(params['id']).subscribe(res => {
        this.user_info = res.result;
        var chatinfo_arr = [["Type", "Count", { role: "style" } ],
        ["Text", this.user_info.chat_text_count, "#009DA0"],
        ["Image", this.user_info.chat_image_count, "#009DA0"],
        ["Audio", this.user_info.chat_audio_count, "#009DA0"],
        ["Video", this.user_info.chat_video_count, "#009DA0"],
        ["Files", this.user_info.chat_file_count, "#009DA0"],
        ["Location", this.user_info.chat_location_count, "#009DA0"],
        ["Contact", this.user_info.chat_contact_count, "#009DA0"]];

        this.doughnutChartData = [this.user_info.status_image_count, this.user_info.status_video_count];
        this.pieChartData = [this.user_info.call_audio_count, this.user_info.call_video_count];
    google.charts.load("current", {packages:['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
 
      var data = google.visualization.arrayToDataTable(chatinfo_arr);
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



  getownchannels()
  {
    this.route.params.subscribe(params => {
      this.user.getownchannelsinfo(params['id']).subscribe(res => {
        this.ownchannels_info = res.result;
      });
    });
  }
    getreportedchannels()
  {
    this.route.params.subscribe(params => {
      this.user.getreportedchannelsinfo(params['id']).subscribe(res => {
        this.reportedchannels_info = res.result;

       
      });
    });
  }
     getsubscribedchannels()
  {
    
    this.route.params.subscribe(params => {
      this.user.getsubscribedchannelsinfo(params['id']).subscribe(res => {
        this.subscribedchannels_info = res.result;
      
       this.subscribedchannels_count = Object.keys(this.subscribedchannels_info).length;
     
      });
    });
  }

  usergroup()
  {
    this.route.params.subscribe(params => {
      this.user.getusergroup(params['id']).subscribe(res => {
        this.usergroup_info = res.result;
         this.usergroupcount = res.count;
      });
    });
  }

    usercontacts()
  {
    this.route.params.subscribe(params => {
      this.user.getusercontacts(params['id']).subscribe(res => {
       
         this.usercontactscount = res.result.length;
         console.log(this.usercontactscount);
      });
    });
  }

}
