import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as chartsData from '../../shared/data/chartjs';
import { environment } from './../../../environments/environment';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  totalusers: any;
  recentusers: any;
  totalgroups: any;
  recentgroups: any;
  totalchannels: any;
  adminchannelscount: any;
  adminchannels: any;
  privatechannelscount: any;
  privatechannels: any;
  publicchannelscount: any;
  publicchannels: any;
  totalchannelscount: any;
  totalCalls: any;
  sharedmediacount: any;
  statusMediaData: any;
  statuschartMediaData: any;
  statusMediaLabels: any;
  usercountry_info: any;
  countrykeys: any;
  url: any;
  onlineuserscount: any;
  totalstatuscount: any;
  totalcountries: any;
  doughnutChartLabels: string[] = ['Groups', 'Channels'];
  doughnutChartData: number[];
  public doughnutChartType = chartsData.doughnutChartType;
  public doughnutChartColors = chartsData.doughnutChartColors;
  public doughnutChartOptions = chartsData.doughnutChartOptions;


  sharedMediaLabels: string[] = ['Images', 'Audio', 'Video'];
  sharedMediaData: number[];
 
  // Pie
  public pieChartLabels: string[] = ['Android', 'iOS'];
  public pieChartData: number[];
  public pieChartType = chartsData.pieChartType;
  public pieChartColors = chartsData.pieChartColors;
  public pieChartOptions = chartsData.pieChartOptions;

   // Pie
  public channelpieChartLabels: string[] = ['Private', 'Public'];

    // areaChart


  public areaChartData = chartsData.areaChartData;
  public areaChartLabels = ['January1', 'February', 'March', 'April', 'May', 'June', 'July'];
  public areaChartOptions = chartsData.areaChartOptions;
  public areaChartColors = chartsData.areaChartColors;
  public areaChartLegend = chartsData.areaChartLegend;
  public areaChartType = chartsData.areaChartType;
 


  constructor(
    public toastr: ToastrService,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
  ) {
  }
  ngOnInit() {
    this.url = environment.API_URL;

    this.doughnutChartData = [];

    this.pieChartData = [];
    this.sharedMediaData = [];
    this.statusMediaData = [];
    this.statuschartMediaData = [];
 	 this.totalchannels = 0;
    this.totalCalls = 0;
    
    this.user.getusercountrylist().subscribe(res => {
      
     
      var countrynames = [];
      for (let i = 0; i < res.result.length; i++) {

        countrynames.push(res.result[i].country);
      }
    
        this.usercountry_info = countrynames.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
    
      var country_arr = [];
      country_arr.push(['Country', 'Users']);
      for (var key in this.usercountry_info) {
      if(key!=="undefined")
        country_arr.push([key, this.usercountry_info[key]]);
      }
      
      this.totalcountries = country_arr.length - 1;
     
  
      google.charts.load('current', {
        'packages':['geochart'],
        // Note: you will need to get a mapsApiKey for your project.
        // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
        'mapsApiKey': 'AIzaSyBqN_3wtob65prYXsWPGtvaMNzntAzpnes'
      });
      google.charts.setOnLoadCallback(drawRegionsMap);
    
      function drawRegionsMap() {
      
        var data = google.visualization.arrayToDataTable(country_arr);
    
        var options = {
          colorAxis: {colors: ['#1d9f9a', '#1e6383']}
        };
    
        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    
        chart.draw(data, options);
      }
     
      
      });


  
    this.user.getrecentuserlist().subscribe(res => {
      this.totalusers = res.count;
      this.recentusers = res.result;
    });

    this.user.getrecentgrouplist().subscribe(res => {
      this.totalgroups = res.count;
      this.recentgroups = res.result;
    });

    this.user.getprivatechannelslist().subscribe(res => {
      this.privatechannelscount = res.count;
      this.privatechannels = res.result;
    });

    this.user.getpublicchannelslist().subscribe(res => {
      this.publicchannelscount = res.count;
      this.publicchannels = res.result;
    });

     this.user.gettotalchannelslist().subscribe(res => {
      this.totalchannelscount = res.count;
      this.totalchannels = res.result;
    });


    this.user.getplatformusers().subscribe(res => {
      this.pieChartData = [res.result[0].count, 0];
      this.totalCalls = res.calls;
   
    });
    this.user.getonlineusers().subscribe(res => {
       this.onlineuserscount = res.count;

    });
    this.user.getstatuscount().subscribe(res => {
       this.totalstatuscount = parseInt(res.count['image'])+parseInt(res.count['video']);
        
    });

    this.user.getcountbythisyear().subscribe(res => {
      this.doughnutChartData = [res.groupcount, res.channelcount];
    });

    this.user.getsharedmediacount().subscribe(res => {
      this.sharedMediaData = [res.imagecount, res.audiocount, res.videocount];

          google.charts.load("current", {packages:['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      var data = google.visualization.arrayToDataTable([
        ["Type", "Count", { role: "style" } ],
        ["Image", res.imagecount, "#009DA0"],
        ["Audio", res.audiocount, "#009DA0"],
        ["Video", res.videocount, "#009DA0"],
        ["Files", res.filecount, "#009DA0"],
        ["Location", res.locationcount, "#009DA0"],
        ["Contact", res.contactcount, "#009DA0"],
       
      ]);
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
    

    this.user.getstatusmediacount().subscribe(res => {
    this.statusMediaData = res.result;
    var recentdays_status = [];
    var videocnt = 0;
    var imagecnt= 0;
    var statusreportimage = [];
    var statusreportvideo = [];
   
    for (let i = 0; i <=6; i++) {
           
            var dte = new Date(res.recent_days[i]);
       
            dte.setDate(dte.getDate());
            var month = dte.getMonth() + 1;
            var day = dte.getDate() + '-' + month + '-' + dte.getFullYear();
            recentdays_status.push(day);
            if(res.result.findIndex(obj => obj.posted_date==res.recent_days[i]) >= 0)
           {
           		var indexval = res.result.findIndex(obj => obj.posted_date==res.recent_days[i]);
           
           		
          		videocnt =  res.result[indexval].status_video_count;
       			  imagecnt =  res.result[indexval].status_image_count;
        

           }
           else
           {
           	
           	videocnt = 0;
       		  imagecnt = 0;
       		    
       		     	
           }
			statusreportvideo.push(videocnt);
       		statusreportimage.push(imagecnt);
      }
 
      this.statusMediaLabels = recentdays_status;
      this.statuschartMediaData =  [

		  { data: statusreportimage, label: 'Image' },
		  { data: statusreportvideo, label: 'Video' }

		];
		     
      

    });
  
     

  }
  chartHovered(ev){
  }
  chartClicked(ev){
  }
  onChangeEvent(ev) {
  if(ev.target.value==="thisyear")
  {
    this.user.getcountbythisyear().subscribe(res => {
      this.doughnutChartData = [res.groupcount, res.channelcount];
    });

   
  }
  else if(ev.target.value==="thismonth")
  {
    this.user.getcountbythismonth().subscribe(res => {
      this.doughnutChartData = [res.groupcount, res.channelcount];
     
    });

  }
  else
  {
     this.user.getcountbytoday().subscribe(res => {
      this.doughnutChartData = [res.groupcount, res.channelcount];
   
    });

  }
  }




}



