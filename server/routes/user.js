/* npm libraries */
const express = require("express"),
  passport = require("passport"),
  service = express.Router();
require("../userjwt")(passport);

/* models */
let User = require("../models/userModel");
let Groups = require("../models/chatgroupModel");
let Userdevices = require("../models/userdeviceModel");
let Mychannel = require("../models/mychannelModel");
let Userchannel = require("../models/userchannelModel");
let Reports = require("../models/reportModel");
let Userstatus = require("../models/userstatusModel");

/* REDIS SERVER */
let redisServer = require("./redisServer");
/* CHAT SERVER */
let chatServer = require("./chat"); 


/* signin or signup as user */
service.get("/usercount", function(req, res) {
  let nousers = 0;
  User.countDocuments(function(err, usercount) {
    if (err) {
      res.json(nousers);
    } else {
      res.json(usercount);
    }
  });
});



service.get("/getallusersobserve/:page", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
  User.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      User.find()
      .select()
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});


service.get("/getuserlistobservefilter/:filterValue", function(req, res) {
  let users = [];
  let searchquery;
  searchquery = {
    user_name: {
      $regex: req.params.filterValue,
      $options: "i"
    }
  };
  User.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      User.find(searchquery)
        .select()
        .sort({
          _id: -1
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});





/*service.get("/getuserlistobservefilter/:filterValue", function(req, res) {
  let users = [];
  let searchquery;
      searchquery = {
        user_name: {
          $regex: req.params.filterValue,
          $options: "i"
        }
      };

  User.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      User.find(searchquery)
      .select()
      .sort({
        _id: -1
      })
      .exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});
*/

service.get("/getuserlistobservefilterpage/:page/:filterValue", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
let searchquery;
      searchquery = {
        user_name: {
          $regex: req.params.filterValue,
          $options: "i"
        }
      };

  User.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      User.find(searchquery)
      .select()
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});


/* get all user list */
service.get("/getallusers", function(req, res) {
  let users = [];
  User.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      User.find()
        .select()
        .sort({
          _id: -1
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});

service.get("/getallusers/:page", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
  User.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      User.find({})
      .select()
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});


/* Getting the particular user info */

 service.get('/userinfo/:id', function (req, res) {
      let sitesettings = [];
      User.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          User.findOne({
            _id: req.params.id
          }).limit(1).
          exec(function (err, userprofile) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: userprofile
              });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });
    });



 /* Getting the channel  admin info */

 service.get('/getchanneladmininfo/:id', function (req, res) {
  
      let sitesettings = [];
      User.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          User.findOne({
            _id: req.params.id
          }).limit(1).
          exec(function (err, userprofile) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: userprofile
              });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });
    });


/* Getting the particular channel info */
 service.get('/userchannelinfo/:id', function (req, res) {
      let sitesettings = [];
      let users = [];
      Userchannel.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          Userchannel.findOne({
            _id: req.params.id
          }).limit(1).
          exec(function (err, userchannelinfo) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: userchannelinfo
              });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });
    });
/*Getting the report info for particular channel */
  service.get('/userchannelreportinfo/:id', function (req, res) {
      let sitesettings = [];
         let users = [];
      Reports.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          Reports.find({
            channel_id: req.params.id
          }).
          exec(function (err, userchannelinfo) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: userchannelinfo
              });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });
    });
/* Getting the particular user created channels*/
  service.get('/ownchannelsinfo/:id', function (req, res) {
      let sitesettings = [];
      Userchannel.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          Userchannel.find({
            channel_admin_id: req.params.id
          }).
          exec(function (err, userchannelinfo) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: userchannelinfo
              });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });
    });


   /* Getting the particular user reported channels*/
  service.get('/reportedchannelsinfo/:id', function (req, res) {
      let sitesettings = [];
      let users = [];
      Reports.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          Reports.find({
            user_id: req.params.id
          }).select({
            channel_id:1
          }).
          exec(function (err, userchannelinfo) {
            if (!err) {
            let channelList = [];
            for (let i = 0; i < userchannelinfo.length; i++) {
            
              channelList.push(userchannelinfo[i].channel_id);
            }
        Userchannel.find()
        .where("_id")
        .in(channelList)
      
        .exec(function(err, channelrecords) {
          if (!err) {
            
            res.json({
              status: "true",
              result: channelrecords
            });
          } else {
            senderr(res);
          }
        });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });


 });


 /* Getting the particular user subscribed channels*/
  service.get('/subscribedchannelsinfo/:id', function (req, res) {
 let result = redisServer.getRedis("userchannels", req.params.id);
      result.then(Channels => {
        let recentChannels = JSON.parse(Channels);
        if (recentChannels.length > 0) {
          Userchannel.find()
            .where("_id")
            .in(recentChannels)
            .exec(function(err, records) {
              if (!err) {
                res.json({
                  status: "true",
                  result: records
                });
              } else {
                consoleerror(res);
              }
            });
        } else {
          res.json({
            status: "false",
            message: "No Channels found",
            result: result
          
          });
        }
      });


 });


 /* Getting the user group list*/
  service.get('/usergroupinfo/:id', function (req, res) {
      let sitesettings = [];
        let users = [];
      Groups.countDocuments(function (err, usercount) {
        if (usercount > 0) {

          Groups.find({
            
            "group_members.member_id": req.params.id
        
           
          }).
          exec(function (err, userchannelinfo) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: userchannelinfo
              });
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });
    });




   /* Getting the online user count*/
  // service.get('/getonlineusers', function (req, res) {
  //       redisServer.redisClient.get("liveusercount", function(
  //             err,
  //             userscount
  //           ) {
  //             res.json({
  //               status: true,
  //               count: userscount,
                
  //             });
  //           });

  //   });

    service.get('/getonlineusers', function (req, res) {
        //console.log("TEST123");
        User.countDocuments(
          {
            livestatus: "online"
          },
          function (err, count) {
            res.json({
              status: true,
              count: count,  
            });
        });
    });


     /* Getting the total status count*/
  service.get('/getstatuscount', function (req, res) {
        redisServer.redisClient.hgetall("statuscount" ,function(
              err,
              statuscount
            ) {
              res.json({
                status: true,
                count: statuscount,
                
              });
            });

    });


       /* Getting the total status count*/
  service.get('/getusercontacts/:id', function (req, res) {
              if (!req.params.id) {
      consoleerror(res);
    } else {
      redisServer.redisClient.hget("contactlibrary", req.params.id, function(
        err,
        contactresult
      ) {
        if (!err && contactresult != null) {
          let usercontacts = JSON.parse(contactresult);
         
          res.json({
            status: "true",
            result: usercontacts
          });
        } else {
          res.json({
            status: "false",
            result: []
          });
        }
      });
    }
    });



   /* Getting the user recent calls list*/
  service.get('/userrecentcallsinfo/:id', function (req, res) {
          if (!req.params.id) {
      consoleerror(res);
    } else {
      redisServer.redisClient.hget("livecalls", req.params.id, function(
        err,
        recentchatresult
      ) {
        if (!err && recentchatresult != null) {
          let recentChats = JSON.parse(recentchatresult);
          redisServer.redisClient.hdel("livecalls", req.params.user_id);
          res.json({
            status: "true",
            result: recentChats.missedcalls
          });
        } else {
          res.json({
            status: "false",
            message: "No Calls found"
          });
        }
      });
    }
    });

/* get all user's channels list */
service.get("/getuserchannels", function(req, res) {
  let users = [];
  Userchannel.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      Userchannel.find({
       
            block_status: 0
         
      })
        .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
           channel_image: 1
        })
        .sort({
          _id: -1
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});



service.get("/getactivechannellistobserve/:page", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
  Userchannel.countDocuments(function(err, usercount) {
    if (usercount > 0) {
        Userchannel.find({
       
            block_status: 0
         
      })
        .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});


service.get("/getactivechannellistobservefilter/:filterValue", function(req, res) {
  let users = [];
  let searchquery;
  searchquery = {
    channel_name: {
      $regex: req.params.filterValue,
      $options: "i"
    },
     block_status: 0
  };
  Userchannel.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      Userchannel.find(searchquery)
       .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
        .sort({
          _id: -1
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});



service.get("/getactivechannellistobservefilterpage/:page/:filterValue", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
let searchquery;
      searchquery = {
        channel_name: {
          $regex: req.params.filterValue,
          $options: "i"
        },
        block_status: 0
      };

  Userchannel.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      Userchannel.find(searchquery)
      .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});

/*Getting the blocked channels list */
service.get("/getblockedchannels", function(req, res) {
  let users = [];
  Userchannel.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      Userchannel.find({
       
            block_status: 1
         
      })
        .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
        .sort({
          _id: -1
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});



service.get("/getblockedchannellistobserve/:page", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
    let searchquery;
  searchquery = {
    
     block_status: 1
  };
  Userchannel.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
        Userchannel.find({
       
            block_status: 1
         
      })
        .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});


service.get("/getblockedchannellistobservefilter/:filterValue", function(req, res) {
  let users = [];
  let searchquery;
  searchquery = {
    channel_name: {
      $regex: req.params.filterValue,
      $options: "i"
    },
     block_status: 1
  };
  Userchannel.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      Userchannel.find(searchquery)
       .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
        .sort({
          _id: -1
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});



service.get("/getblockedchannellistobservefilterpage/:page/:filterValue", function(req, res) {
  let users = [];
  var page = parseInt(req.params.page)-1;
  var limit=15;
  var offset = limit * page;
let searchquery;
      searchquery = {
        channel_name: {
          $regex: req.params.filterValue,
          $options: "i"
        },
        block_status: 1
      };

  Userchannel.countDocuments(searchquery, function(err, usercount) {
    if (usercount > 0) {
      Userchannel.find(searchquery)
      .select({
          channel_name: 1,
          channel_type: 1,
          total_subscribers: 1,
          report_count: 1,
          created_date: 1,
          created_time: 1,
          active_status: 1,
          channel_image: 1
        })
      .sort({
        _id: -1
      })
      .skip(offset).limit(limit).exec(function(err,allusers){
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              page: page,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});

 service.delete('/blockchannel/:id', function (req, res) {
      if (!req.params.id) {
    senderr(res);
  } else {
    let showmessage,
      updateblockstatus = 1;
    Userchannel.countDocuments(
      {
        _id: req.params.id
      },
      function(err, channelcount) {
        if (channelcount > 0) {
          Userchannel.findById(req.params.id).exec(function(err, channelinfo) {
            if (err) {
              senderr(res);
            } else {
              showmessage = "Channel blocked successfully";
                    let blockedData = {
                    channel_id: req.params.id,
                    status: "1" // For active channels use "0"
                    };              
               

           
              channelinfo.block_status = updateblockstatus;
              channelinfo.save();
              chatServer.io.sockets.emit('blockchannel', blockedData);
              res.json({
                status: true,
                message: showmessage
              });
            }
          });
        } else {
          senderr(res);
        }
      }
    );
  }

     
    });

/* get recent groups list */
service.get("/getrecentgroups", function(req, res) {
  let groups = [];
  Groups.countDocuments(function(err, groupcount) {
    if (groupcount > 0) {
      Groups.find()
        .select({
          group_members_count: 1,
          group_members: 1,
          group_name: 1,
          group_image: 1,
          _id: 0
        })
        .sort({
          _id: -1
        })
        .limit(5)
        .exec(function(err, allgroups) {
          if (!err) {
            res.json({
              status: true,
              count: groupcount,
              result: allgroups
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: groups
      });
    }
  });
});
/* get all user list */
service.get("/getrecentusers", function(req, res) {
  let users = [];
  User.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      User.find()
        .select({
          user_name: 1,
          user_image: 1,
          about: 1,
          _id: 1
        })
        .sort({
          _id: -1
        })
        .limit(5)
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});


service.get("/getuserscountry", function(req, res) {
  let users = [];
  User.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      User.find()
        .select({
          country: 1,
          _id: 0
        })
        .exec(function(err, allusers) {
          if (!err) {
            res.json({
              status: true,
              count: usercount,
              result: allusers
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: users
      });
    }
  });
});

/* get trending public channels */
service.get("/getpublicchannels", function(req, res) {
  let users = [];
  Userchannel.countDocuments(
    {
       channel_type: "public"
    },
    function(err, usercount) {
      if (usercount > 0) {
        Userchannel.find({
          channel_type: "public"
        })
          .select({
            channel_name: 1,
            total_subscribers: 1,
            _id: 1,
             channel_image:1
          })
          .sort({
            total_subscribers: -1
          })
          .limit(5)
          .exec(function(err, allusers) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: allusers
              });
            } else {
              senderr(res);
            }
          });
      } else {
        res.json({
          status: false,
          count: 0,
          result: users
        });
      }
    }
  );
});


/* get  total channels */
service.get("/gettotalchannels", function(req, res) {
  let users = [];
  Userchannel.countDocuments(
    {
      $or: [
        {
          channel_type: "public"
        },
        {
          channel_type: "private"
        }
      ]
    },
    function(err, usercount) {
      if (usercount > 0) {
        Userchannel.find({
          $or: [
        {
          channel_type: "public"
        },
        {
          channel_type: "private"
        }
      ]
        })
          .select({
            channel_name: 1,
            total_subscribers: 1,
            _id: 0
          })
          .sort({
            total_subscribers: -1
          })
          .limit(5)
          .exec(function(err, allusers) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: allusers
              });
            } else {
              senderr(res);
            }
          });
      } else {
        res.json({
          status: false,
          count: 0,
          result: users
        });
      }
    }
  );
});

/* get trending private channels */
service.get("/getprivatechannels", function(req, res) {
  let users = [];
  Userchannel.countDocuments(
    {
      channel_type: "private"
    },
    function(err, usercount) {
      if (usercount > 0) {
        Userchannel.find({
          channel_type: "private"
        })
          .select({
            channel_name: 1,
            total_subscribers: 1,
            _id: 1,
            channel_image:1
          })
          .sort({
            total_subscribers: -1
          })
          .limit(5)
          .exec(function(err, allusers) {
            if (!err) {
              res.json({
                status: true,
                count: usercount,
                result: allusers
              });
            } else {
              senderr(res);
            }
          });
      } else {
        res.json({
          status: false,
          count: 0,
          result: users
        });
      }
    }
  );
});

/* get all userdevices list */
service.get("/getplatformlist", function(req, res) {
  let users = [];
  Userdevices.countDocuments(function(err, usercount) {
    if (usercount > 0) {
      Userdevices.aggregate(
        [
          {
            $group: {
              _id: "$device_type",
              count: {
                $sum: 1
              }
            }
          }
        ],
        function(err, userdevices) {
          if (err) {
            senderr(res);
          } else {
            redisServer.redisClient.get("successcalls", function(
              err,
              totalcalls
            ) {
              res.json({
                status: true,
                count: usercount,
                calls: totalcalls,
                result: userdevices
              });
            });
          }
        }
      );
    } else {
      res.json({
        status: false,
        count: 0,
        calls: 0,
        result: users
      });
    }
  });
});

/* get all by month list */
service.get("/getmonthlist", function(req, res) {
  let users = [];
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let timestamp = firstDay.getTime() / 1000;
  Groups.countDocuments(
    {
      created_at: {
        $gte: timestamp
      }
    },
    function(err, groupcount) {
      if (!err) {
        Userchannel.countDocuments(
          {
            created_time: {
              $gte: timestamp
            }
          },
          function(err, channelcount) {
            if (!err) {
              res.json({
                status: true,
                groupcount: groupcount,
                channelcount: channelcount
              });
            }
          }
        );
      }
    }
  );
});


service.get("/getyearlist", function(req, res) {
  let users = [];
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), 1, 1);
  let timestamp = firstDay.getTime() / 1000;
  Groups.countDocuments(
    {
      created_at: {
        $gte: timestamp
      }
    },
    function(err, groupcount) {
      if (!err) {
        Userchannel.countDocuments(
          {
            created_time: {
              $gte: timestamp
            }
          },
          function(err, channelcount) {
            if (!err) {
              res.json({
                status: true,
                groupcount: groupcount,
                channelcount: channelcount
              });
            }
          }
        );
      }
    }
  );
});

service.get("/gettodaylist", function(req, res) {
  let users = [];
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let timestamp = firstDay.getTime() / 1000;
  Groups.countDocuments(
    {
      created_at: {
        $gte: timestamp
      }
    },
    function(err, groupcount) {
      if (!err) {
        Userchannel.countDocuments(
          {
            created_time: {
              $gte: timestamp
            }
          },
          function(err, channelcount) {
            if (!err) {
              res.json({
                status: true,
                groupcount: groupcount,
                channelcount: channelcount
              });
            }
          }
        );
      }
    }
  );
});


/* get media shared count*/
service.get("/getsharedmedia", function(req, res) {
     let sitesettings = [];
     let imagecount = 0;
     let audiocount = 0;
     let videocount = 0;
     let locationcount = 0;
     let filecount = 0;
     let contactcount = 0;
      User.countDocuments(function (err, usercount) {
        if (usercount > 0) {
          User.find().
          exec(function (err, userinfo) {
            if (!err) {
            let channelList = [];
            for (let i = 0; i < userinfo.length; i++) {
              imagecount += userinfo[i].chat_image_count;
              audiocount += userinfo[i].chat_audio_count;
              videocount += userinfo[i].chat_video_count;
              filecount += userinfo[i].chat_file_count;
              locationcount += userinfo[i].chat_location_count;
              contactcount += userinfo[i].chat_contact_count;
             
            }
              res.json({
              status: "true",
              imagecount: imagecount,
              audiocount: audiocount,
              videocount: videocount,  
              filecount: filecount,
              locationcount: locationcount,
              contactcount: contactcount
            });
     
            } else {
              consoleerror(err);
            }
          });
        } else {
          res.json({
            status: false,
            count: 0,
            result: users
          });
        }
      });

});



/* get status media count*/
service.get("/getstatusmedia", function(req, res) {
    var recentdays_status = [];
    var lastday =[];
   
          for (let i = 6; i >=0; i--) {
           
                 var dte = new Date();
                 var thedate =dte.setDate(dte.getDate() - i);
                 recentdays_status.push(dte.setHours(0,0,0,0));
          }
      Userstatus.countDocuments(function (err, usercount) {
        if (usercount > 0) {
      Userstatus.find()
        .where("posted_date")
        .in(recentdays_status)
      
        .exec(function(err, statusrecords) {
          if (!err) {
            
            res.json({
              status: "true",
              result: statusrecords,
              recent_days:recentdays_status
            });
          } else {
            senderr(res);
          }
        });
        } else {
          res.json({
            status: false,
            count: 0,
            result: recentdays_status
          });
        }
      });

});

/* get channel reports */
service.get("/channelreports/:id", function(req, res) {
  let channelreports = [];
  let searchquery = {
    channel_id: req.params.id
  };
  Reports.countDocuments(searchquery, function(err, reportcount) {
    if (reportcount > 0) {
      Reports.find(searchquery)
        .populate("user_id")
        .exec(function(err, channelreports) {
          if (!err) {
            res.json({
              status: true,
              count: reportcount,
              result: channelreports
            });
          } else {
            consoleerror(err);
          }
        });
    } else {
      res.json({
        status: false,
        count: 0,
        result: channelreports
      });
    }
  });
});

/* block (or) unblock channel */
service.delete("/blockit/:id", function(req, res) {
  if (!req.params.id) {
    senderr(res);
  } else {
    let showmessage,
      updateblockstatus = 0;
    Userchannel.countDocuments(
      {
        _id: req.params.id
      },
      function(err, channelcount) {
        if (channelcount > 0) {
          Userchannel.findById(req.params.id).exec(function(err, channelinfo) {
            if (err) {
              senderr(res);
            } else {
              showmessage = "Channel unblocked successfully";
                    let blockedData = {
                    channel_id: req.params.id,
                    status: "0" // For active channels use "0"
                    };              
               

           
              channelinfo.block_status = updateblockstatus;
              channelinfo.save();
              chatServer.io.sockets.emit('blockchannel', blockedData);
              res.json({
                status: true,
                message: showmessage
              });
            }
          });
        } else {
          senderr(res);
        }
      }
    );
  }
});

/* delete report */
service.delete("/deletereport/:id", function(req, res) {
  Reports.findById(req.params.id, function(err, reportdata) {
    if (!err) {
      let userchannel_id = reportdata.channel_id;
      Reports.findByIdAndRemove(req.params.id, function(err, reports) {
        if (err) {
          senderr(res);
        } else {
          res.json({
            status: true,
            message: "Report ignored successfully"
          });
          DownReportcount(userchannel_id);
        }
      });
    } else {
      senderr(res);
    }
  });
});

/* UPDATE REPORT COUNT */
let DownReportcount = function(channelId) {
  Userchannel.findOneAndUpdate(
    {
      _id: channelId
    },
    {
      $inc: {
        report_count: -1
      }
    },
    function(err) {
      if (err) {
        consoleerror(err);
      }
    }
  );
};

/* TIMEZONE BY SERVER */
timeZone = function() {
  let selectedDate = new Date();
  // selectedDate.setHours(selectedDate.getHours() + 5);
  // selectedDate.setMinutes(selectedDate.getMinutes() + 30);
  let currentDate = selectedDate;
  let currentTime = currentDate.getTime();
  let localOffset = -1 * selectedDate.getTimezoneOffset() * 60000;
  let timestamp = Math.round(
    new Date(currentTime + localOffset).getTime() / 1000
  );
  let newtimestamp = timestamp;
  return newtimestamp;
};

/* send error messages */
senderr = function(res) {
  res.json({
    status: "false",
    message: "Something went to be wrong"
  });
};

module.exports = service;