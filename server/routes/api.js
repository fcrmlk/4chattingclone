/*  NPM PACKAGES */
const express = require("express"),
  passport = require("passport"),
  jwt = require("jsonwebtoken"),
  multer = require("multer"),
  path = require("path"),
  fs = require("fs"),
  service = express.Router();
require("../userjwt")(passport);
require('dotenv').config();

/* MODELS */
let User = require("../models/userModel");
let Block = require("../models/blockModel");
let UserDevices = require("../models/userdeviceModel");
let Chatgroups = require("../models/chatgroupModel");
let Helps = require("../models/helpModel");
let Userchannels = require("../models/userchannelModel");
let Channelmessages = require("../models/channelmessageModel");
let MyChannel = require("../models/mychannelModel");
let Sitesetting = require("../models/sitesettingModel");
let Reports = require("../models/reportModel");

/* CHAT SERVER */
let chatServer = require("./chat");

/* REDIS SERVER */
let redisServer = require("./redisServer");

/* SIGNUP OR SIGN USER */
service.post("/signin", function (req, res) {
  if (!req.body.phone_no || !req.body.country_code || !req.body.country) {
    senderr(res);
  } else {
    let matchString = {
      phone_no: req.body.phone_no
    };

    Sitesetting.findOne().sort({ _id: -1 }).exec(function (err, sitesettings) {
      if (!err) {
        User.findOne(matchString, function (err, userdata) {
          if (!userdata) {
            req.body.status = "true";
            req.body.privacy_last_seen = "everyone";
            req.body.privacy_profile_image = "everyone";
            req.body.privacy_about = "everyone";
            req.body.user_image = "";
            req.body.about = sitesettings.about_text;
            req.body.country = req.body.country;
            let newUser = new User(req.body);
            newUser.save(function (err, createduserdata) {
              if (!err) {
                res.json(createduserdata);
              } else {
                senderr(res);
              }
            });
          } else {
            let signintoken = jwt.sign(userdata.toObject(), process.env.JWT_SECRET);
            userdata.token = "Bearer " + signintoken;
            if (req.body.user_name) {
              User.findOneAndUpdate(
                {
                  _id: userdata._id
                },
                {
                  $set: {
                    user_name: req.body.user_name,
                    country: req.body.country
                  }
                },
                {
                  new: true
                }
              ).exec(function (err) {
                if (err) {
                  senderr(res);
                } else {
                  userdata.user_name = req.body.user_name;
                  userdata.country = req.body.country;
                  res.json(userdata);
                }
              });
            } else {
              res.json(userdata);
            }
          }
        });
      } else {
        senderr(res);
      }
    });
  }
});

let userstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.ASSETS_PATH + "users/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

/* USER PROFILE IMAGE UPLOAD */
service.post("/upmyprofile", function (req, res) {
  let userupload = multer({
    storage: userstorage
  }).single("user_image");
  userupload(req, res, function (err) {
    User.findOne(
      {
        _id: req.body.user_id
      },
      function (err, user) {
        if (user) {
          if (
            typeof user.user_image != "undefined" &&
            user.user_image != "user.png"
          ) {
            unlinkFile(process.env.ASSETS_PATH + "users/" + user.user_image);
          }
          let imageFile =
            typeof res.req.file.filename !== "undefined"
              ? res.req.file.filename
              : "";
          user.user_image = imageFile;
          user.save(function (err, userdata) {
            if (!err) {
              res.json({
                status: "true",
                user_image: imageFile,
                message: "Image uploaded successfully"
              });
              let userdetails = {
                user_id: req.body.user_id,
                user_image: imageFile
              };
              chatServer.io.sockets.emit("changeuserimage", userdetails);
            } else {
              senderr(res);
            }
          });
        } else {
          senderr(res);
        }
      }
    );
  });
});

let chatstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.ASSETS_PATH + "chats/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

/* USER CHAT UPLOAD */
service.post("/upmychat", function (req, res) {
  let chatupload = multer({
    storage: chatstorage
  }).single("attachment");
  chatupload(req, res, function (err) {
    User.findOne(
      {
        _id: req.body.user_id
      },
      function (err, userdata) {
        if (userdata) {
          res.json({
            status: "true",
            user_image:
              typeof res.req.file.filename !== "undefined"
                ? res.req.file.filename
                : "",
            message: "Message uploaded successfully"
          });
        } else {
          senderr(res);
        }
      }
    );
  });
});

/* UPDATE USER PROFILE */
service.post(
  "/updatemyprofile",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    User.countDocuments(
      {
        _id: req.body.user_id
      },
      function (err, count) {
        if (count > 0) {
          User.findOneAndUpdate(
            {
              _id: req.body.user_id
            },
            {
              $set: req.body
            },
            {
              new: true
            }
          ).exec(function (err, userdata) {
            if (err) {
              senderr(res);
            } else {
              userdata.user_image = userdata.user_image;
              userdata.status = "true";
              res.json(userdata);
            }
          });
        } else {
          res.json({
            status: "false",
            message: "No user found"
          });
        }
      }
    );
  }
);

/* UPDATE USER PROFILE */
service.post(
  "/updatemyprivacy",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    User.countDocuments(
      {
        _id: req.body.user_id
      },
      function (err, count) {
        if (count > 0) {
          User.findOneAndUpdate(
            {
              _id: req.body.user_id
            },
            {
              $set: req.body
            },
            {
              new: true
            }
          ).exec(function (err, userdata) {
            if (err) {
              senderr(res);
            } else {
              let userdetails = {
                user_id: req.body.user_id,
                privacy_last_seen: userdata.privacy_last_seen,
                privacy_about: userdata.privacy_about,
                privacy_profile_image: userdata.privacy_profile_image
              };
              chatServer.io.sockets.emit("makeprivate", userdetails);
            }
          });
        } else {
          res.json({
            status: "false",
            message: "No user found"
          });
        }
      }
    );
  }
);

/* VIEW USER PROFILE */
service.get(
  "/getuserprofile/:phone_no/:contact_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    User.countDocuments(
      {
        _id: req.params.contact_id
      },
      function (err, count) {
        if (count > 0) {
          User.findOne(
            {
              _id: req.params.contact_id
            },
            function (err, userdata) {
              if (userdata) {
                userdata.contactstatus = "false";
                redisServer.redisClient.hget(
                  "contactlibrary",
                  req.params.contact_id.toString(),
                  function (err, contactcircle) {
                    if (!err && contactcircle != null) {
                      let contactObject = JSON.parse(contactcircle);
                      if (
                        contactObject != null &&
                        contactObject.toString().indexOf(req.params.phone_no) >=
                        0
                      ) {
                        userdata.contactstatus = "true";
                      }
                      res.json(userdata);
                    } else {
                      res.json(userdata);
                    }
                  }
                );
              } else {
                senderr(res);
              }
            }
          );
        } else {
          res.json({
            status: "false",
            message: "No user found"
          });
        }
      }
    );
  }
);

/* UPDATE MY CONTACTS */
service.post(
  "/updatemycontacts",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (
      req.body.contacts !== null &&
      typeof req.body.contacts !== "undefined"
    ) {
      var contactList = JSON.parse(req.body.contacts);
      let nocontacts = {
        status: "false",
        message: "No contacts found"
      };
      User.find({
        _id: {
          $ne: req.body.user_id
        }
      })
        .where("phone_no")
        .in(contactList)
        .exec(function (err, contactrecords) {
          if (!err) {
            if (contactrecords.length > 0) {
              let phone = req.body.phone_no;
              let getmycontacts = myContacts(contactrecords, phone);
              getmycontacts.then(resdata => {
                res.json({
                  status: "true",
                  result: resdata
                });
              });
            } else {
              res.json(nocontacts);
            }
          } else {
            senderr(res);
          }
        });
    } else {
      res.json(nocontacts);
    }
  }
);

let myContacts = function (contactrecords, phone) {
  return new Promise(function (resolve, reject) {
    let contactData = [];
    for (let i = 0; i < contactrecords.length; i++) {
      let contactId = contactrecords[i]._id;
      contactrecords[i].contactstatus = "false";
      redisServer.redisClient.hget(
        "contactlibrary",
        contactId.toString(),
        function (err, contactcircle) {
          if (!err && contactcircle != null) {
            let contactObject = JSON.parse(contactcircle);
            if (
              contactObject != null &&
              contactObject.toString().indexOf(phone) >= 0
            ) {
              contactrecords[i].contactstatus = "true";
            }
          }
          contactData.push(contactrecords[i]);
          resolve(contactData);
        }
      );
    }
  });
};

/* SAVE MY CONTACTS */
service.post(
  "/savemycontacts",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (
      req.body.contacts !== null &&
      typeof req.body.contacts !== "undefined"
    ) {
      var contactList = JSON.parse(req.body.contacts);
      User.find({
        _id: {
          $ne: req.body.user_id
        }
      })
        .where("phone_no")
        .in(contactList)
        .exec(function (err, contactrecords) {
          if (!err) {
            let contactList = CustomizeObject(contactrecords, "phone_no");
            redisServer.redisClient.hset(
              "contactlibrary",
              req.body.user_id,
              JSON.stringify(contactList)
            );
            res.json({
              status: "true",
              message: "Contacts saved successfully"
            });
          } else {
            senderr(res);
          }
        });
    } else {
      senderr(res);
    }
  }
);

/* GET USER BLOCK STATUS */
service.get(
  "/getblockstatus/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    let searchwhoblockedme = {
      buser_id: req.params.user_id
    };
    let searchiblocked = {
      user_id: req.params.user_id
    };
    let blockedme = [];
    let blockedbyme = [];
    Block.find(searchwhoblockedme).exec(function (err, blockedmelist) {
      if (!err) {
        blockedme = blockedmelist;
        Block.find(searchiblocked).exec(function (err, blockedlist) {
          if (!err) {
            blockedbyme = blockedlist;
            res.json({
              status: "true",
              blockedme: blockedme,
              blockedbyme: blockedbyme
            });
          } else {
            senderr(res);
          }
        });
      } else {
        senderr(res);
      }
    });
  }
);

/* RECENT CHATS WHEN BACK TO ONLINE */
service.get(
  "/recentchats/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      redisServer.redisClient.hget("privatemessages", req.params.user_id, function (err, messageinfo) {
        if (!err) {
          if (messageinfo != null) {
            let privatemessages = JSON.parse(messageinfo);
            res.json({
              status: "true",
              result: privatemessages
            });
          }
          else {
            res.json({
              status: "false",
              message: "No Chats found"
            });
          }
        }
        else {
          senderr(res);
        }
      });
    }
  }
);

/* USER DEVICE REGISTER */
service.post(
  "/pushsignin",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (
      !req.body.user_id ||
      !req.body.device_token ||
      !req.body.device_type ||
      !req.body.device_id
    ) {
      senderr(res);
    } else {
      UserDevices.countDocuments(
        {
          user_id: req.body.user_id
        },
        function (err, count) {
          if (count > 0) {
            UserDevices.deleteMany(
              {
                user_id: req.body.user_id
              },
            ).exec(function (err, userdevices) {
              if (err) {
                senderr(res);
              } else {
                UserDevices.deleteMany(
                  {
                    device_id: req.body.device_id
                  },
                ).exec(function (err, clearuserdevices) {
                  UserDevices.findOneAndUpdate(
                    {
                      user_id: req.body.user_id
                    },
                    {
                      $set: req.body
                    },
                    {
                      upsert: true,
                      new: true
                    }
                  ).exec(function (err, userdevices) {
                    if (err) {
                      senderr(res);
                    } else {
                      res.json({
                        status: "true",
                        message: "Registered successfully"
                      });
                    }
                  });
                });
              }
            });
          } else {
            UserDevices.deleteMany(
              {
                device_id: req.body.device_id
              },
            ).exec(function (err, userdevices) {
              if (err) {
                senderr(res);
              } else {
                let newDevices = new UserDevices(req.body);
                newDevices.save(function (err) {
                  if (!err) {
                    res.json({
                      status: "true",
                      message: "Registered successfully"
                    });
                  } else {
                    consoleerror(err);
                  }
                });
              }
            });

          }
        }
      );
    }
  });

/* USER DEVICE UNREGISTER */
service.delete(
  "/pushsignout",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.body.device_id) {
      senderr(res);
    } else {
      UserDevices.countDocuments(
        {
          device_id: req.body.device_id
        },
        function (err, count) {
          if (count > 0) {
            UserDevices.findOneAndRemove(
              {
                device_id: req.body.device_id
              },
              function (err, count) {
                res.json({
                  status: "true",
                  message: "Unregistered successfully"
                });
              }
            );
          } else {
            senderr(res);
          }
        }
      );
    }
  }
);

/* VALIDATE USER BY DEVICE */
service.post(
  "/deviceinfo",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    User.findOne({ _id: req.body.user_id }, function (err, userdata) {
      if (!err && userdata) {
        UserDevices.countDocuments(
          {
            user_id: req.body.user_id,
            device_id: req.body.device_id
          },
          function (err, count) {
            if (count > 0) {
              res.json({
                status: "true",
                message: "device exists"
              });
            } else {
              res.json({
                status: "false",
                message: "no device exists"
              });
            }
          });
      }
      else {
        res.json({
          status: "false",
          message: "no user exists"
        });
      }
    });
});


/* USER EXISTS */
service.post("/userexists", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id) {
    senderr(res);
  } else {
    User.findOne({ _id: req.body.user_id }, function (err, userdata) {
      if (!err && userdata) {
        res.json({
          status: "true",
          message: "user exists"
        });
      }
      else {
        res.json({
          status: "false",
          message: "no user exists"
        });
      }
    });
  }
});

/* CHAT RECEIVED STATUS */
service.post(
  "/chatreceived",
  function (req, res) {
    if (!req.body.message_id || !req.body.sender_id || !req.body.receiver_id) {
      senderr(res);
    } else {
      let data = {
        user_id:req.body.user_id,
        sender_id:req.body.sender_id,
        receiver_id:req.body.receiver_id,
        message_id:req.body.message_id
      };
      // REMOVE THE PRIVATE MESSAGES
      redisServer.redisClient.hget("privatemessages", req.body.receiver_id, function(err, messageinfo) {
          if (messageinfo != null) {
            let privatemessages = JSON.parse(messageinfo);
            delete privatemessages[req.body.message_id];
            redisServer.redisClient.hset(
              "privatemessages",
              req.body.receiver_id,
              JSON.stringify(privatemessages)
            );
          }
        }
      );
      // SAVE THE UNREAD MESSAGES
      if (typeof req.body.sender_id != "undefined" && req.body.sender_id != null) {
         chatServer.io.in(req.body.sender_id).emit('receivedstatus', data); 
        redisServer.redisClient.hget("offlinemessages", req.body.sender_id, function (err, messageinfo) {
          if (messageinfo != null) {
            let offlinemessages = JSON.parse(messageinfo);
            offlinemessages[data.message_id] = data;
            redisServer.redisClient.hset("offlinemessages", req.body.sender_id, JSON.stringify(offlinemessages));
          } else {
            let offlinemessages = {};
            offlinemessages[data.message_id] = data;
            redisServer.redisClient.hset("offlinemessages", req.body.sender_id, JSON.stringify(offlinemessages));
          }
        });
      }
      res.json({
        status: "true",
        message: "It is working fine"
      });
    }
  }
);


/* CHAT RECEIVED STATUS */
service.post("/groupchatreceived", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id || !req.body.message_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("groupchats", req.body.user_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let groupchats = JSON.parse(messageinfo);
        delete groupchats[req.body.message_id];
        redisServer.redisClient.hset("groupchats", req.body.user_id, JSON.stringify(groupchats));
      }
    });
    res.json({
      status: "true",
      message: "Chats cleared successfully"
    });
  }
});

/* CHANNEL CHAT RECEIVED STATUS */
service.post("/channelchatreceived", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id || !req.body.message_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("userchannelchats", req.body.user_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let userchannelchats = JSON.parse(messageinfo);
        delete userchannelchats[req.body.message_id];
        redisServer.redisClient.hset("userchannelchats", req.body.user_id, JSON.stringify(userchannelchats));
      }
    });
    res.json({
      status: "true",
      message: "Chats cleared successfully"
    });
  }
});

/* CHANNEL CHAT RECEIVED STATUS */
service.post("/storyreceived", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id || !req.body.story_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("storyreceivers", req.body.user_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let storyreceivers = JSON.parse(messageinfo);
        delete storyreceivers[req.body.story_id];
        redisServer.redisClient.hset("storyreceivers", req.body.user_id, JSON.stringify(storyreceivers));
      }
    });
    res.json({
      status: "true",
      message: "Stories cleared successfully"
    });
  }
});


service.post("/clearstoryviewed", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id || !req.body.story_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("storyviewers", req.body.user_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let storyviewers = JSON.parse(messageinfo);
        delete storyviewers[req.body.story_id];
        redisServer.redisClient.hset("storyviewers", req.body.user_id, JSON.stringify(storyviewers));
      }
    });
    res.json({
      status: "true",
      message: "Stories cleared successfully"
    });
  }
});

service.post("/clearofflinedeletedstories", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id || !req.body.story_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("storyofflinedelete", req.body.user_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let storyofflinedelete = JSON.parse(messageinfo);
        delete storyofflinedelete[req.body.story_id];
        redisServer.redisClient.hset("storyofflinedelete", req.body.user_id, JSON.stringify(storyofflinedelete));
      }
    });
    res.json({
      status: "true",
      message: "Stories cleared successfully"
    });
  }
});

/* CLEAR CHANNEL INVITES */
service.post("/clearchannelinvites", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.body.user_id || !req.body.channel_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("userchannelinvites", req.body.user_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let userchannelinvites = JSON.parse(messageinfo);
        delete userchannelinvites[req.body.channel_id];
        redisServer.redisClient.hset("userchannelinvites", req.body.user_id, JSON.stringify(userchannelinvites));
      }
    });
    res.json({
      status: "true",
      message: "Invites cleared successfully"
    });
  }
});

/* UPDATE GROUP INFORMATION  */
service.post("/modifyGroupinfo", passport.authenticate("jwt", { session: false }), function (req, res) {
  let query;
  Chatgroups.countDocuments(
    {
      _id: req.body.group_id
    },
    function (err, count) {
      if (count > 0) {
        if (req.body.group_members) {
          let updategroupmembers = JSON.parse(req.body.group_members);
          query = Chatgroups.findOneAndUpdate(
            {
              _id: req.body.group_id,
              "group_members.member_id": updategroupmembers[0].member_id
            },
            {
              $set: {
                "group_members.$.member_role": updategroupmembers[0].member_role,
                modified_at: timeZone(),
                modified_by: req.body.user_id
              }
            },
            {
              new: true
            });
        } else {
          req.body.modified_at = timeZone();
          req.body.modified_by = req.body.user_id;
          query = Chatgroups.findOneAndUpdate(
            {
              _id: req.body.group_id
            },
            {
              $set: req.body
            },
            {
              new: true
            }
          );
        }
        query.exec(function (err, groupdata) {
          if (err) {
            senderr(res);
          } else {
            res.json({
              status: "true",
              result: groupdata
            });
          }
        });
      } else {
        res.json({
          status: "false",
          message: "No Groups found"
        });
      }
    }
  );
});

/* UPDATE GROUP MEMBERS INFORMATION  */
service.post(
  "/modifyGroupmembers",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    Chatgroups.countDocuments(
      {
        _id: req.body.group_id
      },
      function (err, count) {
        if (count > 0) {
          req.body.group_members = JSON.parse(req.body.group_members);
          let query = {
            _id: req.body.group_id
          },
            update = {
              $set: {
                modified_at: timeZone(),
                modified_by: req.body.user_id
              },
              $push: {
                group_members: {
                  $each: req.body.group_members,
                }
              }
            },
            options = {
              upsert: true,
              new: true
            };
          Chatgroups.findOneAndUpdate(query, update, options, function (
            err,
            groupdata
          ) {
            if (!err && !groupdata) {
              senderr(res);
            } else {
              res.json({
                status: "true",
                result: groupdata
              });
            }
          });
        } else {
          res.json({
            status: "false",
            message: "No Groups found"
          });
        }
      }
    );
  }
);

/* GET GROUPS INFO */
service.post(
  "/groupinfo",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    var groupList = JSON.parse(req.body.group_list);
    Chatgroups.find()
      .where("_id")
      .in(groupList)
      .exec(function (err, grouprecords) {
        if (!err) {
          res.json({
            status: "true",
            result: grouprecords
          });
        } else {
          senderr(res);
        }
      });
  }
);

/* GET GROUP INVITES  */
service.get("/groupinvites/:user_id", function (req, res) {
  redisServer.redisClient.hget("groupinvites", req.params.user_id, function (err, groupinvitations) {
    if (!err && groupinvitations != null) {
      let groupinvitelist = JSON.parse(groupinvitations);
      res.json({
        status: "true",
        result: groupinvitelist
      });
    } else {
      res.json({
        status: "false",
        message: "No Invites found"
      });
    }
  });
});

let groupchatstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.ASSETS_PATH + "chats/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

/* GROUP IMAGE UPLOAD */
service.post("/modifyGroupimage", function (req, res) {
  let groupchatupload = multer({
    storage: groupchatstorage
  }).single("group_image");
  groupchatupload(req, res, function (err) {
    req.body.modified_at = timeZone();
    req.body.modified_by = req.body.user_id;
    req.body.group_image = res.req.file.filename;
    Chatgroups.findOne(
      {
        _id: req.body.group_id
      },
      function (err, groupdata) {
        if (err) {
          senderr(res);
        } else {
          if (
            typeof groupdata.group_image != "undefined" &&
            groupdata.group_image != ""
          ) {
            unlinkFile(process.env.ASSETS_PATH + "groupchats/" + groupdata.group_image);
          }
          Chatgroups.findOneAndUpdate(
            {
              _id: req.body.group_id
            },
            {
              $set: req.body
            },
            function (err) {
              if (err) {
                senderr(res);
              } else {
                res.json({
                  status: "true",
                  group_image:
                    typeof res.req.file.filename !== "undefined"
                      ? res.req.file.filename
                      : "",
                  message: "Group Image uploaded successfully"
                });
              }
            }
          );
        }
      }
    );
  });
});

/* GROUP CHAT UPLOAD */
service.post("/upmygroupchat", function (req, res) {
  let chatupload = multer({
    storage: groupchatstorage
  }).single("group_attachment");
  chatupload(req, res, function (err) {
    User.findOne(
      {
        _id: req.body.user_id
      },
      function (err, userdata) {
        if (userdata) {
          res.json({
            status: "true",
            user_image:
              typeof res.req.file.filename !== "undefined"
                ? res.req.file.filename
                : "",
            message: "Group Chat uploaded successfully"
          });
        } else {
          senderr(res);
        }
      }
    );
  });
});

/* RECENT GROUP CHATS WHEN BACK TO ONLINE */
service.get("/recentgroupchats/:user_id", passport.authenticate("jwt", { session: false }) ,function (req, res) {
  if (!req.params.user_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("groupchats", req.params.user_id, function (err, recentchatresult) {
      if (!err && recentchatresult != null) {
        let recentChats = JSON.parse(recentchatresult);
        res.json({
          status: "true",
          result: recentChats
        });
      } else {
        res.json({
          status: "false",
          message: "No Chats found"
        });
      }
    });
  }
});

/* RECENT CHANNEL CHATS WHEN BACK TO ONLINE */
service.get("/recentofflinestories/:user_id", passport.authenticate("jwt", { session: false }) ,function (req, res) {
  if (!req.params.user_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("storyreceivers", req.params.user_id, function (err, recentchatresult) {
      if (!err && recentchatresult != null) {
        let recentChats = JSON.parse(recentchatresult);
        res.json({
          status: "true",
          result: recentChats
        });
      } else {
        res.json({
          status: "false",
          message: "No Chats found"
        });
      }
    });
  }
});

/* RECENT CHANNEL CHATS WHEN BACK TO ONLINE */
service.get("/offlinedeletedstories/:user_id", passport.authenticate("jwt", { session: false }) ,function (req, res) {
  if (!req.params.user_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("storyofflinedelete", req.params.user_id, function (err, recentchatresult) {
      if (!err && recentchatresult != null) {
        let recentChats = JSON.parse(recentchatresult);
        res.json({
          status: "true",
          result: recentChats
        });
      } else {
        res.json({
          status: "false",
          message: "No Chats found"
        });
      }
    });
  }
});

/* RECENT CHANNEL CHATS WHEN BACK TO ONLINE */
service.get("/recentviewedstories/:user_id", passport.authenticate("jwt", { session: false }) ,function (req, res) {
  if (!req.params.user_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("storyviewers", req.params.user_id, function (err, recentchatresult) {
      if (!err && recentchatresult != null) {
        let recentChats = JSON.parse(recentchatresult);
        res.json({
          status: "true",
          result: recentChats
        });
      } else {
        res.json({
          status: "false",
          message: "No Chats found"
        });
      }
    });
  }
});

service.get(
  "/recentcalls/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      redisServer.redisClient.hget("livecalls", req.params.user_id, function (
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
  }
);

/* HELPS */
service.get("/helps", function (req, res) {
  let result = {};
  result.status = "true";
  Helps.find(
    {
      type: "terms"
    },
    function (err, helpterms) {
      result.terms = [];
      if (!err) {
        result.terms = helpterms;
      }
      Helps.find(
        {
          type: "helps"
        },
        function (err, faqterms) {
          result.faq = faqterms;
          res.json(result);
        }
      );
    }
  );
});

/* GET CHANNEL INFO */
service.post("/channelinfo", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (req.body.channel_list !== null && typeof req.body.channel_list !== "undefined") {
    var channelList = JSON.parse(req.body.channel_list);
    let selectquery = {
      user_name: 1
    };
    Userchannels.find()
      .where("_id")
      .in(channelList)
      .populate("channel_admin_id", selectquery)
      .exec(function (err, channelrecords) {
        if (!err) {
          let allchannels = [];
          for (let i = 0; i < channelrecords.length; i++) {
            if ("channel_admin_id" in channelrecords[i]) {
              channelrecords[i].channel_adminId =
                channelrecords[i].channel_admin_id._id;
              channelrecords[i].channel_admin =
                channelrecords[i].channel_admin_id.user_name;
              channelrecords[i].channel_admin_id = "";
            }
            allchannels.push(channelrecords[i]);
          }
          res.json({
            status: "true",
            result: allchannels
          });
        } else {
          senderr(res);
        }
      });
  } else {
    senderr(res);
  }
});

/* UPDATE CHANNEL INFO */
service.post(
  "/updatemychannel",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    Userchannels.countDocuments(
      {
        _id: req.body.channel_id
      },
      function (err, count) {
        if (count > 0) {
          Userchannels.findOneAndUpdate(
            {
              _id: req.body.channel_id
            },
            {
              $set: req.body
            },
            {
              new: true
            }
          ).exec(function (err, channeldata) {
            if (err) {
              senderr(res);
            } else {
              let resultdata = channeldata;
              resultdata.status = "true";
              res.json(resultdata);
            }
          });
        } else {
          res.json({
            status: "false",
            message: "No channel found"
          });
        }
      }
    );
  }
);

let channelstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.ASSETS_PATH + "chats/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

/* GROUP IMAGE UPLOAD */
service.post("/modifyChannelimage", function (req, res) {
  let channelupload = multer({
    storage: channelstorage
  }).single("channel_attachment");
  channelupload(req, res, function (err) {
    req.body.modified_at = timeZone();
    req.body.modified_by = req.body.user_id;
    req.body.channel_image =
      typeof res.req.file.filename !== "undefined" ? res.req.file.filename : "";
    Userchannels.findOne(
      {
        _id: req.body.channel_id
      },
      function (err, channeldata) {
        if (err) {
          if (
            typeof channeldata.channel_image != "undefined" &&
            channeldata.channel_image != ""
          ) {
            unlinkFile(process.env.ASSETS_PATH + "channels/" + channeldata.channel_image);
          }
        } else {
          Userchannels.findOneAndUpdate(
            {
              _id: req.body.channel_id
            },
            {
              $set: req.body
            },
            function (err) {
              if (err) {
                senderr(res);
              } else {
                res.json({
                  status: "true",
                  channel_image: req.body.channel_image,
                  message: "Channel Image uploaded successfully"
                });
              }
            }
          );
        }
      }
    );
  });
});

/* GROUP CHAT UPLOAD */
service.post("/upmychannelchat", function (req, res) {
  let channelupload = multer({
    storage: channelstorage
  }).single("channel_attachment");
  channelupload(req, res, function (err) {
    User.findOne(
      {
        _id: req.body.user_id
      },
      function (err, userdata) {
        if (userdata) {
          res.json({
            status: "true",
            user_image:
              typeof res.req.file.filename !== "undefined"
                ? res.req.file.filename
                : "",
            message: "Channel Chat uploaded successfully"
          });
        } else {
          senderr(res);
        }
      }
    );
  });
});

/* RECENT CHANNEL CHATS WHEN BACK TO ONLINE */
service.get("/recentChannelChats/:user_id", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.params.user_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("userchannelchats", req.params.user_id, function (err, recentchatresult) {
      if (!err && recentchatresult != null) {
        let recentChats = JSON.parse(recentchatresult);
        res.json({
          status: "true",
          result: recentChats
        });
      } else {
        res.json({
          status: "false",
          message: "No Chats found"
        });
      }
    });
  }
});

/* RECENT CHANNEL INVITES WHEN BACK TO ONLINE */
service.get("/recentChannelInvites/:user_id", passport.authenticate("jwt", { session: false }), function (req, res) {
  if (!req.params.user_id) {
    senderr(res);
  } else {
    redisServer.redisClient.hget("userchannelinvites", req.params.user_id, function (err, channelinvitations) {
      if (!err && channelinvitations != null) {
        let channelinvitelist = JSON.parse(channelinvitations);
        res.json({
          status: "true",
          result: channelinvitelist
        });
      } else {
        res.json({
          status: "false",
          message: "No Invites found"
        });
      }
    });
  }
});

/* RECENT ADMIN CHANNEL CHATS  */
service.get(
  "/msgfromadminchannels/:timestamp",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.timestamp) {
      senderr(res);
    } else {
      Channelmessages.countDocuments(
        {
          message_date: {
            $gte: req.params.timestamp
          }
        },
        function (err, channelcount) {
          if (channelcount > 0) {
            Channelmessages.find({
              message_date: {
                $gte: req.params.timestamp
              }
            }).exec(function (err, channelrecords) {
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
            res.json({
              status: "false",
              messsage: "No Channel Messages found"
            });
          }
        }
      );
    }
  }
);

/* USER'S OWN CHANNELS */
service.get(
  "/MyChannels/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      let searchquery = {
        channel_admin_id: req.params.user_id,
        left_status: 0
      };
      Userchannels.countDocuments(searchquery, function (err, channelcount) {
        if (channelcount > 0) {
          Userchannels.find(searchquery).exec(function (err, channelrecords) {
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
          res.json({
            status: "false",
            messsage: "No Channels found"
          });
        }
      });
    }
  }
);

/* USER'S SUBSCRIBED CHANNELS */
service.get(
  "/MySubscribedChannels/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      let result = redisServer.getRedis("userchannels", req.params.user_id);
      result.then(Channels => {
        let recentChannels = JSON.parse(Channels);
        if (recentChannels.length > 0) {
          Userchannels.find()
            .where("_id")
            .in(recentChannels)
            .exec(function (err, records) {
              if (!err) {
                res.json({
                  status: "true",
                  result: records
                });
              } else {
                senderr(res);
              }
            });
        } else {
          res.json({
            status: "false",
            message: "No Channels found"
          });
        }
      });
    }
  }
);

/* ALL PUBLIC CHANNELS */
service.get(
  "/AllPublicChannels/:user_id/:search_string/:offset/:limit",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      let searchquery;
      searchquery = {
        channel_type: "public",
        left_status: 0,
        block_status: 0,
        channel_name: {
          $regex: req.params.search_string,
          $options: "i"
        }
      };
      if (req.params.search_string == "all") {
        searchquery = {
          channel_type: "public",
          left_status: 0,
          block_status: 0
        };
      }
      const limit = parseInt(req.params.limit);
      const offset = parseInt(req.params.offset);
      Userchannels.countDocuments(searchquery)
        .limit(limit)
        .skip(offset)
        .sort({
          _id: -1
        })
        .exec(function (err, channelcount) {
          if (channelcount > 0) {
            Userchannels.find(searchquery)
              .limit(limit)
              .skip(offset)
              .sort({
                _id: -1
              })
              .exec(function (err, channelrecords) {
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
            res.json({
              status: "false",
              messsage: "No Channels found"
            });
          }
        });
    }
  }
);

/* CHANNEL'S SUBSCRIBERS */
service.get(
  "/channelSubscribers/:channel_id/:phone_no/:offset/:limit",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.channel_id || !req.params.phone_no) {
      senderr(res);
    } else {
      let result = redisServer.getRedis("livechannels", req.params.channel_id);
      let noresult = {
        status: "false",
        message: "No Subscribers found"
      };
      result.then(Subscribers => {
        let TotalSubscribers = JSON.parse(Subscribers);
        if (TotalSubscribers.length > 0) {
          let from = parseInt(req.params.offset);
          let userlimit = parseInt(req.params.limit);
          let to = from + userlimit;
          limitSubscribers = TotalSubscribers.slice(from, to);
          User.find()
            .where("_id")
            .in(limitSubscribers)
            .exec(function (err, records) {
              if (!err) {
                if (records != null) {
                  let phone = req.params.phone_no;
                  let getmycontacts = myContacts(records, phone);
                  getmycontacts.then(resdata => {
                    res.json({
                      status: "true",
                      result: resdata
                    });
                  });
                } else {
                  res.json(noresult);
                }
              } else {
                senderr(res);
              }
            });
        } else {
          res.json(noresult);
        }
      });
    }
  }
);

/* RECENT ADMIN CHANNEL CHATS  */
service.get(
  "/adminchannels/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      MyChannel.countDocuments(function (err, channelcount) {
        if (channelcount > 0) {
          MyChannel.find().exec(function (err, channelrecords) {
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
          res.json({
            status: "false",
            messsage: "No Channels found"
          });
        }
      });
    }
  }
);

/* RECENT ADMIN CHANNEL CHATS  */
service.get("/channelsubscriberids/:channel_id", passport.authenticate("jwt", { session: false }),
  function (req, res) {
    if (!req.params.channel_id) {
      senderr(res);
    } else {
      let result = redisServer.getRedis("livechannels", req.params.channel_id);
      let noresult = {
        status: "false",
        message: "No Subscribers found"
      };
      result.then(Subscribers => {
        let channelSubscribers = JSON.parse(Subscribers);
        if (channelSubscribers) {
          if (channelSubscribers.length > 0) {
            let subscriberList = [...new Set(channelSubscribers)];
            res.json({
              status: "true",
              subscribers: subscriberList
            });
          }
          else {
            res.json(noresult);
          }
        }
        else {
          res.json(noresult);
        }
      });
    }
  }
);

service.get(
  "/deleteMyAccount/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      let userId = req.params.user_id;
      /* select queries */
      let blocksearch = {
        $or: [
          {
            user_id: userId
          },
          {
            buser_id: userId
          }
        ]
      };
      let userchannelsearch = {
        channel_admin_id: userId
      };

      /* deleting user's channels & block status */
      Block.deleteMany(blocksearch, function (err) {
        if (!err) {
          Userchannels.deleteMany(userchannelsearch, function (err) {
            groupContactDeleted(req.params.user_id);
            if (!err) {
              res.json({
                status: "true",
                message: "Account deleted successfully"
              });
            }
          });
        }
      });
    }
  }
);

/* GROUP CONTACT DELETED */
let groupContactDeleted = function (userId) {
  redisServer.redisClient.hget("usergroups", userId.toString(), function (
    err,
    mygroups
  ) {
    if (mygroups != null && !err) {
      var exitgroups = JSON.parse(mygroups);
      Chatgroups.find()
        .where("_id")
        .in(exitgroups)
        .exec(function (err, groupList) {
          if (!err) {
            if (groupList.length > 0) {
              for (let i = 0; i < groupList.length; i++) {
                let groupId = groupList[i];
                exitGroupMember(userId, groupId);
              }
            }
            DeleteUser(userId);
          }
        });
    } else {
      DeleteUser(userId);
    }
  });
};

/* EXIT GROUP ON CONTACT DELETED */
let exitGroupMember = function (userId, groupId) {
  Chatgroups.updateOne(
    {
      _id: groupId
    },
    {
      $pull: {
        group_members: {
          member_id: userId
        }
      }
    },
    err => {
      if (!err) {
        redisServer.pullRedis("groups", groupId, userId);
        redisServer.pullRedis("usergroups", userId, groupId);
      }
    }
  );
};

let DeleteUser = function (userId) {
  let userdevicesearch = {
    user_id: userId
  };
  let usersearch = {
    _id: userId
  };
  UserDevices.deleteMany(userdevicesearch, function (err) {
    if (!err) {
      User.deleteOne(usersearch, function (err) {
        if (!err) {
          redisServer.deleteRedis("liveusers", userId);
          redisServer.deleteRedis("contactlibrary", userId);
          redisServer.deleteRedis("unreadmessages", userId);
          redisServer.deleteRedis("offlinemessages", userId);
          redisServer.deleteRedis("groupchats", userId);
          redisServer.deleteRedis("userchannelchats", userId);
          redisServer.deleteRedis("userchannelinvites", userId);
          redisServer.deleteRedis("groupinvites", userId);
          redisServer.deleteRedis("userchannels", userId);
          redisServer.deleteRedis("usergroups", userId);
        } else {
          consoleerror(err);
        }
      });
    }
  });
};

/* USER'S JOINED GROUPS */
service.get(
  "/MyGroups/:user_id",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id) {
      senderr(res);
    } else {
      let result = redisServer.getRedis("usergroups", req.params.user_id);
      result.then(Groups => {
        let recentGroups = JSON.parse(Groups);
        if (recentGroups.length > 0) {
          Chatgroups.find()
            .where("_id")
            .in(recentGroups)
            .exec(function (err, records) {
              if (!err) {
                res.json({
                  status: "true",
                  result: records
                });
              } else {
                senderr(res);
              }
            });
        } else {
          res.json({
            status: "false",
            message: "No Groups found"
          });
        }
      });
    }
  }
);

service.get(
  "/changeMyNumber/:user_id/:phone_no/:country_code",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (
      !req.params.user_id ||
      !req.params.phone_no ||
      !req.params.country_code
    ) {
      senderr(res);
    } else {
      User.countDocuments(
        {
          phone_no: req.params.phone_no
        },
        function (err, count) {
          if (count > 0) {
            res.json({
              status: "false",
              message: "Account already exists with this number"
            });
          } else {
            User.findOneAndUpdate(
              {
                _id: req.params.user_id
              },
              {
                $set: {
                  phone_no: req.params.phone_no,
                  country_code: req.params.country_code
                }
              },
              {
                new: true
              }
            ).exec(function (err, userdata) {
              if (err) {
                senderr(res);
              } else {
                let userresult = {};
                userresult.user_id = userdata._id;
                userresult.phone_no = userdata.phone_no;
                userresult.user_name = userdata.user_name;
                res.json({
                  status: "true",
                  result: userresult
                });
              }
            });
          }
        }
      );
    }
  }
);

service.get(
  "/verifyMyNumber/:user_id/:phone_no",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.user_id || !req.params.phone_no) {
      senderr(res);
    } else {
      User.countDocuments(
        {
          phone_no: req.params.phone_no
        },
        function (err, count) {
          if (count > 0) {
            res.json({
              status: "false",
              message: "Account already exists with this number"
            });
          } else {
            res.json({
              status: "true",
              message: "Kindly verify with new number"
            });
          }
        }
      );
    }
  }
);

/* getall sitesettings */
service.get("/checkforupdates", function (req, res) {
  let sitesettings = [];
  Sitesetting.countDocuments(function (err, sitesettingscount) {
    if (sitesettingscount > 0) {
      Sitesetting.findOne()
        .sort({
          _id: -1
        })
        .exec(function (err, sitesettings) {
          if (!err) {
            res.json({
              status: true,
              android_update: sitesettings.android_update,
              android_version: sitesettings.android_version,
              ios_update: sitesettings.ios_update,
              ios_version: sitesettings.ios_version
            });
          } else {
            senderr(res);
          }
        });
    } else {
      res.json(sitesettings);
    }
  });
});

/* 1.1 VERSION */

/* REPORT CHANNEL */
service.post(
  "/reportchannel",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    if (!req.body.user_id || !req.body.channel_id || !req.body.status) {
      senderr(res);
    } else {
      if (req.body.status == "new") {
        let newReports = new Reports(req.body);
        newReports.save(function (err) {
          if (!err) {
            res.json({
              status: "true",
              message: "Reported successfully"
            });
            updateReportcount(req.body.channel_id, 1, req.body.status);
          } else {
            senderr(err);
          }
        });
      } else if (req.body.status == "delete") {
        Reports.countDocuments(
          {
            channel_id: req.body.channel_id,
            user_id: req.body.user_id
          },
          function (err, count) {
            if (count > 0) {
              Reports.findOneAndRemove(
                {
                  channel_id: req.body.channel_id,
                  user_id: req.body.user_id
                },
                function (err, count) {
                  res.json({
                    status: "true",
                    message: "Undo report successfully"
                  });
                  updateReportcount(req.body.channel_id, 1, req.body.status);
                }
              );
            } else {
              senderr(res);
            }
          });
      } else {
        senderr(res);
      }
    }
  }
);

/* UPDATE REPORT COUNT */
let updateReportcount = function (channelId, count, status) {
  if (status == "delete")
    count = count * -1;

  Userchannels.findOneAndUpdate(
    {
      _id: channelId
    },
    {
      $inc: {
        report_count: count
      }
    },
    function (err) {
      if (err) {
        consoleerror(err);
      }
    }
  );
};

/* JWT AUTHENTICATION */
getToken = function (headers) {
  if (headers && headers.authorization) {
    return headers.authorization;
  } else {
    return null;
  }
};

/* SEND ERROR MESSAGES */
senderr = function (res) {
  res.json({
    status: "false",
    message: "Something went to be wrong"
  });
};

/* DELETE FILE */
unlinkFile = function (imagepath) {
  fs.unlink(imagepath, function (err) {
    if (!err) {
      // console.log('File deleted!');
    } else {
      // console.log('File not deleted!');
    }
  });
};

/*Reset unreadcount */
service.get(
  "/resetunread/:apns_token",
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res) {
    if (!req.params.apns_token) {
      senderr(res);
    } else {
      UserDevices.findOneAndUpdate(
        {
          apns_token: req.params.apns_token
        },
        {
          $set: {
            unread_count: 0,
          }
        }
      ).exec(function (err, userdevices) {
        if (err) {
          /* console.log(err); */
        } 
      });
    }
  }
);

/* Terms and Policy */
service.get("/termsandpolicy", function (req, res) {
  let resultpage = {};
  Helps.find(
    {
      title: "Terms & Conditions"
    },
    function (err, helpterms) {
      if (!err) {
        for (let i = 0; i < helpterms.length; i++) {
          resultpage.tos = helpterms[i].description;
        }
      }
      Helps.find(
        {
          title: "Privacy Policy"
        },
        function (err, faqterms) {
          for (let j = 0; j < faqterms.length; j++) {
            resultpage.privacy_policy = faqterms[j].description;
          }
          res.json({
            status: "true",
            result: resultpage
          });
        });
    });
});

/* TIMEZONE BY SERVER */
timeZone = function () {
  return moment().toISOString();
};

module.exports = service;