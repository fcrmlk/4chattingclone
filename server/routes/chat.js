require('dotenv').config()
const httpsMode = process.env.SSL;
const passport = require("passport");
const fs = require("fs"),
  express = require("express"),
  chatservice = express.Router(),
  app = express();
const moment = require('moment');
require("../userjwt")(passport);
let server = require("http").createServer(app);
if (httpsMode == 1) {
  let privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH);
  let certificate = fs.readFileSync(process.env.SSL_CERT_PATH);
  let ca = fs.readFileSync(process.env.SSL_CHAIN_PATH);

  /* SSL OPTIONS */
  const sslOptions = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };

  server = require("https").createServer(sslOptions, app);
}

const io = require("socket.io")(server, {
  pingInterval: 2000,
  pingTimeout: 5000
});

/* MODELS */
let Block = require("../models/blockModel");
let Chatgroups = require("../models/chatgroupModel");
let Userchannels = require("../models/userchannelModel");
let Users = require("../models/userModel");
let Userstatus = require("../models/userstatusModel");
let MuteNotifications = require("../models/mutenotificationModel");

/* SOCKET.IO CONNECTVITY */
server.listen(process.env.SOCKET_PORT, function () {
  console.log("SOCKET IS RUNNING ON PORT1", process.env.SOCKET_PORT);
});

/* PUSHNOTIFICATIONS */
let notificationServer = require("./pushNotification");

/* REDIS SERVER */
let redisServer = require("./redisServer");


// const wrapMiddlewareForSocketIo = middleware => (socket, next) => middleware(socket.request, {}, next);
// io.use(wrapMiddlewareForSocketIo(passport.initialize()));
// io.use(wrapMiddlewareForSocketIo(passport.authenticate(['jwt'])));

/* ON SOCKET CONNECTS */
io.on("connection", function (socket) {


  /* console.log(io.sockets.getMaxListeners()); */

  /* CONNECTING TO CHATBOX PRIVATE CHAT */
  socket.on("chatbox", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null) {
      console.log("User " + data.user_id + " is connected with userid" + socket.id);
      socket.user_id = data.user_id; // socket session user's id
      updateUserLiveStatus(data.user_id, "online");
      socket.join(data.user_id);
      io.in(data.user_id).emit("chatboxjoined", data);
      redisServer.redisClient.hset("liveusers", data.user_id, JSON.stringify({ lastseen: moment().toISOString(), livestatus: "online" },));
    }
  });

  /* PING TO CHATBOX PRIVATE CHAT */
  socket.on("golive", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null) {
      let userGroups = (typeof data.groups !== "undefined")? JSON.parse(data.groups) : {};
      let userChannels = (typeof data.channels !== "undefined")? JSON.parse(data.channels) : {};
      socket.user_id = data.user_id; // socket session user's id
      updateUserLiveStatus(data.user_id, "online");
      socket.join(userGroups);
      socket.join(userChannels);
      let liveData = {};
      liveData.livestatus = "online";
      liveData.contact_id = data.user_id;
      socket.broadcast.emit("onlinestatus", liveData);
      redisServer.redisClient.hset("liveusers", data.user_id, JSON.stringify({ lastseen: moment().toISOString(), livestatus: "online" }));
    }
  });

  /* Leave CHATBOX */
  socket.on("goaway", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null) {
      let liveData = {};
      liveData.livestatus = "offline";
      liveData.contact_id = data.user_id;
      liveData.lastseen = moment().toISOString();
      socket.broadcast.emit("onlinestatus", liveData);
      updateUserLiveStatus(data.user_id, "offline");
      redisServer.redisClient.hset("liveusers", data.user_id, JSON.stringify({ lastseen: moment().toISOString(), livestatus: "offline" }));
    }
  });

  /* CHECKING THE READ RECEIPTS*/
  socket.on("readreceipts", function (data) {
    if (typeof data.sender_id != "undefined" && data.sender_id != null) {
      redisServer.redisClient.hget("offlinemessages", data.sender_id, function (err, offlinemessages) {
        if (offlinemessages != null && !err) {
          io.in(data.sender_id).emit("offlinereceivedstatus", JSON.parse(offlinemessages));
        }
      });
      redisServer.redisClient.hget("unreadmessages", data.sender_id, function (err, offlinechats) {
        if (offlinechats != null && !err) {
          io.in(data.sender_id).emit("offlinereadstatus", JSON.parse(offlinechats));
        }
      });
    }
  });

  /* CHECK YOUR FRIEND IS TYPING IN CHATBOX*/
  socket.on("typing", function (data) {
    if (typeof data.receiver_id != "undefined" && data.receiver_id != null) {
      socket.broadcast.to(data.receiver_id).emit("listentyping", data);
    }
  });

  /* START MESSSAGING YOUR FRIEND */
  socket.on("startchat", function (data) {
    redisServer.redisClient.hget("privatemessages", data.receiver_id, function (err, messageinfo) {
      if (messageinfo != null) {
        let privatemessages = JSON.parse(messageinfo);
        privatemessages[data.message_data.message_id] = data;
        redisServer.redisClient.hset("privatemessages", data.receiver_id, JSON.stringify(privatemessages));
      } else {
        let privatemessages = {};
        privatemessages[data.message_data.message_id] = data;
        redisServer.redisClient.hset("privatemessages", data.receiver_id, JSON.stringify(privatemessages));
      }
    });
    socket.broadcast.to(data.receiver_id).emit("receivechat", data);
    filterPrivateNotifications("single", data);
    //Increment chat count for user and over all count
    if(data.message_data.message_type){
      updateUserChatCount(data.sender_id, data.message_data.message_type);
    }
  });


  // Filter Notifications
  filterPrivateNotifications = function (chatType, chatData) {
    let notificationData = { user_id: chatData.receiver_id, chat_id: chatData.sender_id, chat_type: chatType };
    MuteNotifications.countDocuments(notificationData, function (err, muteStatus) {
      if (muteStatus == 0) {
        notificationServer.sendNotification(chatData.receiver_id, chatData.message_data.message, chatData);
      }
    });
  }

  /* MESSAGE RECEIVED BY YOUR FRIEND */
  socket.on("chatreceived", function (data) {
    if (typeof data.message_id != "undefined" && data.message_id != null) {
      // REMOVE THE PRIVATE MESSAGES
      redisServer.redisClient.hget("privatemessages", data.receiver_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let privatemessages = JSON.parse(messageinfo);
          delete privatemessages[data.message_id];
          redisServer.redisClient.hset("privatemessages", data.receiver_id, JSON.stringify(privatemessages));
        }
      });
      // SAVE THE UNREAD MESSAGES
      if (typeof data.sender_id != "undefined" && data.sender_id != null) {
        socket.broadcast.to(data.sender_id).emit("receivedstatus", data);
        redisServer.redisClient.hget("offlinemessages", data.sender_id, function (err, messageinfo) {
          if (messageinfo != null) {
            let offlinemessages = JSON.parse(messageinfo);
            offlinemessages[data.message_id] = data;
            redisServer.redisClient.hset("offlinemessages", data.sender_id, JSON.stringify(offlinemessages));
          } else {
            let offlinemessages = {};
            offlinemessages[data.message_id] = data;
            redisServer.redisClient.hset("offlinemessages", data.sender_id, JSON.stringify(offlinemessages));
          }
        });
      }
    }
  });

  /* CHAT VIEWED BY YOUR FRIEND */
  socket.on("chatviewed", function (data) {
    if (typeof data.sender_id != "undefined" && data.sender_id != null) {
      socket.broadcast.to(data.sender_id).emit("readstatus", data);
      redisServer.redisClient.hget("unreadmessages", data.sender_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let unreadmessages = JSON.parse(messageinfo);
          unreadmessages[data.chat_id] = data;
          redisServer.redisClient.hset("unreadmessages", data.sender_id, JSON.stringify(unreadmessages));
        } else {
          let unreadmessages = {};
          unreadmessages[data.chat_id] = data;
          redisServer.redisClient.hset("unreadmessages", data.sender_id, JSON.stringify(unreadmessages));
        }
      });
    }
  });

  /* CLEAR UNREAD MESSAGES */
  socket.on("clearreadmessages", function (data) {
    if (typeof data.chat_id != "undefined" && data.chat_id != null && typeof data.sender_id != "undefined" && data.sender_id != null) {
      /* REMOVE THE PRIVATE MESSAGES */
      redisServer.redisClient.hget("unreadmessages", data.sender_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let unreadmessages = JSON.parse(messageinfo);
          delete unreadmessages[data.chat_id];
          redisServer.redisClient.hset("unreadmessages", data.sender_id, JSON.stringify(unreadmessages));
        }
      });
    }
  });

  /* CLEAR OFFLINE MESSAGES */
  socket.on("clearreceivedmessages", function (data) {
    if (typeof data.sender_id != "undefined" && data.sender_id != null && typeof data.message_id != "undefined" && data.message_id != null) {
      /* REMOVE THE PRIVATE MESSAGES */
      redisServer.redisClient.hget("offlinemessages", data.sender_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let offlinemessages = JSON.parse(messageinfo);
          delete offlinemessages[data.message_id];
          redisServer.redisClient.hset("offlinemessages", data.sender_id, JSON.stringify(offlinemessages));
        }
      });
    }
  });

  /* CHECK YOUR FRIEND ONLINE STATUS */
  socket.on("online", function (data) {
    if (typeof data.contact_id != "undefined" && data.contact_id != null && typeof data.user_id != "undefined" && data.user_id != null) {
      let liveData = {};
      liveData.livestatus = "online";
      liveData.contact_id = data.contact_id;
      redisServer.redisClient.hget("liveusers", data.contact_id, function (err, liveactivity) {
        if (liveactivity != null && !err) {
          let contactactivity = JSON.parse(liveactivity);
          if (contactactivity.livestatus === "offline") {
            liveData.livestatus = "offline";
            liveData.lastseen = contactactivity.lastseen;
          }
          else {
            /* Time Difference */
            let startTime = moment().toISOString();
            let endTime = moment(contactactivity.lastseen);
            let duration = moment.duration(endTime.diff(startTime));
            let lastMinute = Math.abs(Math.round(duration.asMinutes()));
            if (lastMinute > 1) {
              liveData.livestatus = "offline";
              liveData.lastseen = contactactivity.lastseen;
            }
          }
          updateUserLiveStatus(data.contact_id, liveData.livestatus);
          io.in(data.user_id).emit("onlinestatus", liveData);
        } else {
          liveData.livestatus = "offline";
          io.in(data.user_id).emit("onlinestatus", liveData);
        }
      });
    }
  });

  /* BLOCK YOUR FRIEND & MARK HIM AS ENEMY */
  socket.on("block", function (data) {
    console.log("***");
    console.log("Block Socket Called");
    console.log("***");
    let blockdata = {
      user_id: data.sender_id,
      buser_id: data.receiver_id
    };
    Block.countDocuments(blockdata, function (err, count) {
      if (count > 0) {
        Block.findOneAndRemove(blockdata, function (err, count) {
          if (!err) {
            socket.broadcast.to(data.receiver_id).emit("blockstatus", data);
          }
        });
      } else {
        let newBlock = new Block(blockdata);
        newBlock.save(function (err, blockinfo) {
          if (!err) {
            socket.broadcast.to(data.receiver_id).emit("blockstatus", data);
          }
        });
      }
    });
  });

  /* CREATE NEW CHAT GROUP */
  socket.on("creategroup", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null && typeof data.group_name != "undefined" && data.group_name != null &&
      typeof data.group_members != "undefined" && data.group_members != null) {
      let group_members = JSON.parse(JSON.stringify(data.group_members));
      let newChatgroup = new Chatgroups({
        group_admin_id: data.user_id,
        group_name: data.group_name,
        group_members: group_members,
        group_image: "",
        created_at: moment().toISOString()
      });
      newChatgroup.save(function (err, groupinfo) {
        if (!err) {

          let groupId = groupinfo._id.toString();

          // UPDATE TO GROUP ADMIN
          io.in(data.user_id).emit("groupinvitation", groupinfo);

          let memberlist = CustomizeObject(data.group_members, "member_id");
          memberlist.forEach(function (group_memberid) {
            let memberId = group_memberid;
            redisServer.pushRedis("usergroups", memberId, groupId);
            socket.broadcast.to(memberId).emit("groupinvitation", groupinfo);
            groupInvitations(memberId, groupinfo);
          });

          /* GROUP NOTIFICATIONS */
          let groupnotify = { id: groupinfo._id, admin_id: groupinfo.group_admin_id, title: groupinfo.group_name, chat_type: "groupinvitation" };
          let customizeMsg = {};
          customizeMsg.message_data = groupnotify;

          /* REMOVE THE NOTIFICATION FOR GROUP ADMIN */
          const adminIndex = memberlist.indexOf(data.user_id);
          if (adminIndex > -1) {
            memberlist.splice(adminIndex, 1);
          }
          
          filterGroupNotifications(groupinfo._id, memberlist, "You added to this group", customizeMsg);

        } else {
          consoleerror(err);
        }
      });
    }
  });

  filterGroupNotifications = function (groupId, msgMembers, groupMsg, groupMsgDesc) {
    let notificationData = { chat_id: groupId, chat_type: "group" };
    MuteNotifications.find(notificationData, function (err, mutedMembers) {
      if (!err && mutedMembers.length >= 1) {
        mutedMembers.forEach(function (member) {
          const deleteIndex = msgMembers.indexOf(member.user_id);
          if (deleteIndex > -1) {
            msgMembers.splice(deleteIndex, 1);
          }
        });
        if (msgMembers.length > 1) {
          notificationServer.sendNotifications(msgMembers, groupMsg, groupMsgDesc);
        }
      }
      else {
        notificationServer.sendNotifications(msgMembers, groupMsg, groupMsgDesc);
      }
    });
  }

  /* CLEAR GROUP INVITES */
  socket.on("cleargroupinvites", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null && typeof data.group_id != "undefined" && data.group_id != null) {
      redisServer.redisClient.hget("groupinvites", data.user_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let groupinvites = JSON.parse(messageinfo);
          delete groupinvites[data.group_id];
          redisServer.redisClient.hset("groupinvites", data.user_id, JSON.stringify(groupinvites));
        }
      });
    }
  });

  /* JOIN A GROUP */
  socket.on("joingroup", function (data) {
    if (data.member_id != null && typeof data.member_id != "undefined" && data.group_id != null && typeof data.group_id != "undefined") {
      socket.join(data.group_id);
    }
  });

  /* MESSAGING ON GROUP CHAT */
  socket.on("messagetogroup", function (data) {
    if (data.member_id != null && typeof data.member_id != "undefined" && data.group_id != null && typeof data.group_id != "undefined") {
      /* socket.broadcast.to(data.group_id).emit("messagefromgroup", data); */
      io.in(data.group_id).emit('messagefromgroup', data);
      Chatgroups.findById(data.group_id, function (err, groupdata) {
        
        if (data.message_type == "add_member") {
          let newmemberlist = CustomizeObject(data.new_members, "member_id");
          newmemberlist.forEach(function (eachMember) {
            let memberId = eachMember;
            redisServer.pushRedis("usergroups", memberId, data.group_id);
            socket.broadcast.to(memberId).emit("groupinvitation", groupdata);
            groupInvitations(memberId, groupdata);
          });
        }

        if (data.message_type == "add_member" || data.message_type == "left" || data.message_type == "group_image" || data.message_type == "remove_member" || data.message_type == "admin" || data.message_type == "subject" || data.message_type == "change_number") {
          
          let memberlist = CustomizeObject(groupdata.group_members, "member_id");
          memberlist.forEach(function (group_memberid) {
            redisServer.redisClient.hget("groupchats", group_memberid, function (err, messageinfo) {
              if (messageinfo != null) {
                let groupchats = JSON.parse(messageinfo);
                groupchats[data.message_id] = data;
                redisServer.redisClient.hset("groupchats", group_memberid, JSON.stringify(groupchats));
              } else {
                let groupchats = {};
                groupchats[data.message_id] = data;
                redisServer.redisClient.hset("groupchats", group_memberid, JSON.stringify(groupchats));
              }
            });
          });

          let customizeMsg = {};
          customizeMsg.message_data = data;
          /* REMOVE THE NOTIFICATION FOR GROUP ADMIN */
          const adminIndex = memberlist.indexOf(data.member_id);
          if (adminIndex > -1) {
            memberlist.splice(adminIndex, 1);
          }
          if (data.message_type != "add_member" && data.message_type != "left" && data.message_type != "group_image" && data.message_type != "remove_member" && data.message_type != "admin" && data.message_type != "subject" && data.message_type != "change_number") {
            filterGroupNotifications(data.group_id, memberlist, data.message, customizeMsg);
          }
          // filterGroupNotifications(data.group_id, memberlist, data.message, customizeMsg);
        }
        
      
        if (data.message_type == "remove_member") {
          let memberDeleted = data.member_id;
          redisServer.redisClient.hget("groupchats",memberDeleted,function (err, dmessageinfo) {
            if (dmessageinfo != null) {
              let dgroupchats = JSON.parse(dmessageinfo);
              dgroupchats[data.message_id] = data;
              redisServer.redisClient.hset("groupchats",memberDeleted,JSON.stringify(dgroupchats));
            } else {
              let dgroupchats = {};
              dgroupchats[data.message_id] = data;
              redisServer.redisClient.hset("groupchats",memberDeleted,JSON.stringify(dgroupchats));
            }
          });
        }

        //Increment chat count for user and over all count
        updateUserChatCount(data.member_id, data.message_type);
      });
    }
  });

  /* GROUP CHATS RECEIVED */
  socket.on("groupchatreceived", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null && typeof data.message_id != "undefined" && data.message_id != null) {
      redisServer.redisClient.hget("groupchats", data.user_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let groupchats = JSON.parse(messageinfo);
          delete groupchats[data.message_id];
          redisServer.redisClient.hset("groupchats", data.user_id, JSON.stringify(groupchats));
        }
      });
    }
  });

  /* EXIT GROUP  */
  socket.on("exitfromgroup", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.member_id != null && typeof data.member_id != "undefined" && data.group_id != null && typeof data.group_id != "undefined") {
      Chatgroups.countDocuments({ _id: data.group_id }, function (err, count) {
        if (count > 0) {
          Chatgroups.updateOne({ _id: data.group_id },
            {
              $pull: {
                group_members: {
                  member_id: data.member_id
                }
              }
            },
            err => {
              if(!err){
                io.in(data.user_id).emit("memberexited", data);
                io.in(data.member_id).emit("memberexited", data);
                redisServer.pullRedis("usergroups", data.user_id, data.group_id);
              }
            }
          );
        }
      }
      );
    }
  });

  /* LEFT MY ROOM */ 
  socket.on("memberleft", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.group_id != null && typeof data.group_id != "undefined") {
      redisServer.redisClient.hdel("groupchats", data.user_id);
      socket.leave(data.group_id);
    }
  });

  /* TYPING IN GROUP  */
  socket.on("grouptyping", function (data) {
    if (data.member_id != null && typeof data.member_id != "undefined" && data.group_id != null && typeof data.group_id != "undefined") {
      socket.broadcast.to(data.group_id).emit("listengrouptyping", data);
    }
  });

  /* CREATE CHANNEL */
  socket.on("createchannel", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null && typeof data.channel_name != "undefined" && data.channel_name != null && typeof data.channel_type != "undefined" && data.channel_type != null) {
      let newUserChannel = new Userchannels({
        channel_admin_id: data.user_id,
        channel_name: data.channel_name,
        channel_des: data.channel_des,
        channel_type: data.channel_type,
        channel_image: "",
        created_time: moment().toISOString()
      });
      newUserChannel.save(function (err, newchannelinfo) {
        if (!err) {
          io.in(data.user_id).emit("channelcreated", newchannelinfo);
        }
      });
    }
  });

  /* SEND CHANNEL INVITATION */
  socket.on("sendchannelinvitation", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null && typeof data.channel_id != "undefined" && data.channel_id != null && typeof data.invite_subscribers != "undefined" && data.invite_subscribers != null) {
      Userchannels.findById(data.channel_id, function (err, channelinfo) {
        if (!err) {

          let inviteSubscribers = JSON.parse(data.invite_subscribers);

          let newMembers = [];

          inviteSubscribers.forEach(function (eachSubscriber) {
            newMembers.push(eachSubscriber);
            socket.broadcast.to(eachSubscriber).emit("receivechannelinvitation", channelinfo);
            channelInvitations(eachSubscriber, channelinfo);
          });

          /* NOTIFY MEMBERS WITH INVITATIONS */
          if (newMembers.length > 0) {
            let groupnotify = {
              id: channelinfo._id,
              title: channelinfo.channel_name,
              chat_type: "channelinvitation"
            };
            let customizeMsg = {};
            customizeMsg.message_data = groupnotify;
            filterChannelNotifications(channelinfo._id, newMembers, "You got an invitation from channel", customizeMsg);
          }

        } else {
          /* console.log(err); */
        }
      });
    }
  });

  filterChannelNotifications= function(channelId,subscribers,channelMsg,channelMsgData) {
    let notificationData = { chat_id:channelId, chat_type : "channel" };
    MuteNotifications.find(notificationData, function(err, mutedSubscribers) {
      if(!err && mutedSubscribers.length >= 1) {
        mutedSubscribers.forEach(function(subscriber) {
          const deleteIndex = subscribers.indexOf(subscriber.user_id);
          if (deleteIndex > -1) {
            subscribers.splice(deleteIndex, 1);
          }
        });
        if(subscribers.length > 1) {
          notificationServer.sendNotifications(subscribers,channelMsg,channelMsgData);
        }
      }
      else
      { 
        notificationServer.sendNotifications(subscribers,channelMsg,channelMsgData);
      }
    });
  }

  /* SUBSCRIBE CHANNEL */
  socket.on("subscribechannel", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.channel_id != null && typeof data.channel_id != "undefined") {
      redisServer.pushRedis("livechannels", data.channel_id, data.user_id);
      redisServer.pushRedis("userchannels", data.user_id, data.channel_id);
      updateSubscribers(data.channel_id, 1);
    }
  });

  /* UNSUBSCRIBE CHANNEL */
  socket.on("unsubscribechannel", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.channel_id != null && typeof data.channel_id != "undefined") {
      redisServer.pullRedis("livechannels", data.channel_id, data.user_id);
      redisServer.pullRedis("userchannels", data.user_id, data.channel_id);
      updateSubscribers(data.channel_id, -1);
      socket.leave(data.channel_id);
    }
  });

  /* LEAVE CHANNEL */
  socket.on("leavechannel", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.channel_id != null && typeof data.channel_id != "undefined") {
      Userchannels.findOneAndUpdate(
        {
          _id: data.channel_id,
          channel_admin_id: data.user_id
        },
        {
          left_status: 1
        },
        function (err) {
          if (!err) {
            socket.leave(data.channel_id);
          }
        }
      );
    }
  });

   /* CLEAR GROUP INVITES */
   socket.on("clearchannelinvites", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null && typeof data.channel_id != "undefined" && data.channel_id != null) {
      redisServer.redisClient.hget("userchannelinvites", data.user_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let userchannelinvites = JSON.parse(messageinfo);
          delete userchannelinvites[data.channel_id];
          redisServer.redisClient.hset("userchannelinvites", data.user_id, JSON.stringify(userchannelinvites));
        }
      });
    }
  });

  /* UPDATE SUBSCRIBERS */
  let updateSubscribers = function (channelId, count) {
    Userchannels.findOneAndUpdate(
      {
        _id: channelId
      },
      {
        $inc: {
          total_subscribers: count
        }
      },
      function (err) {
        if (err) {
          consoleerror(err);
        }
      }
    );
  };

  /* MESSAGING ON GROUP CHAT */
  socket.on("messagetochannel", function (data) {
    if (data.channel_id != null && typeof data.channel_id != "undefined" && data.message_id != null && typeof data.message_id != "undefined") {
      let searchquery = { _id: data.channel_id, block_status: 0};
      socket.broadcast.to(data.channel_id).emit("messagefromchannel", data);
      Userchannels.countDocuments(searchquery, function (err, channelcount) {
        if (channelcount > 0) {
          let result = redisServer.getRedis("livechannels", data.channel_id);
          let customizeMsg = {};
          customizeMsg.message_data = data;
          result.then(blob => {
            let res = JSON.parse(blob);
            for (let i = 0; i < res.length; i++) {
              let userId = res[i];
              redisServer.redisClient.hget("userchannelchats", userId, function (err, messageinfo) {
                if (messageinfo != null) {
                  let userchannelchats = JSON.parse(messageinfo);
                  userchannelchats[data.message_id] = data;
                  redisServer.redisClient.hset("userchannelchats", userId, JSON.stringify(userchannelchats));
                } else {
                  let userchannelchats = {};
                  userchannelchats[data.message_id] = data;
                  redisServer.redisClient.hset("userchannelchats", userId, JSON.stringify(userchannelchats));
                }
              });

            }
            if (data.message_type != "added" && data.message_type != "subject" && data.message_type != "channel_image" && data.message_type != "channel_des") {
              filterChannelNotifications(data.channel_id, res, data.message, customizeMsg);
            }
            //Increment chat count for channel and over all count
            updateChannelChatCount(data.channel_id, data.message_type);
          });
        } else {
          io.sockets.emit("channelblocked", data);
        }
      }
      );
    }
  });

  /* CALLS */
  socket.on("createcall", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null) {
      io.in(data.user_id).emit("callcreated", data);
      callLogs(data, "createCall");
      let customizeMsg = {};
      customizeMsg.message_data = data;
      customizeMsg.ttl = 259200;

      /* CREATE CALL NOTIFICATION WILL EXPIRED AFTER THIS TIME*/
      if(data.call_type === "created"){
        customizeMsg.ttl = 30; 
      }

      notificationServer.callNotification(data.user_id, "", customizeMsg);
      
    }
  });

  /* Success && missed call logs */
  socket.on("registercalls", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.status != null && typeof data.status != "undefined" && data.receiver_id != null && typeof data.receiver_id != "undefined") {
      /* Success calls */
      if (data.status === "success") {
        redisServer.redisClient.incr("successcalls"); /* on successful calls */
        updateUserCallCount(data.user_id, data.message_data.type);
      }
      /* Missed calls */
      if (data.status === "missed") {
        callLogs(data, "registercalls");
        notificationServer.sendNotification(data.receiver_id, data.message_data.message, data);
      }
      io.in(data.user_id).emit("recentcalls", data);
    }
  });

  /* CREATE STORIES */
  socket.on("poststory", function (data) {
    if (typeof data.user_id != "undefined" && data.user_id != null) {
      let storyMemberList = CustomizeObject(data.story_members, "member_id");
      storyMemberList.forEach(function (story_memberid) {
        socket.broadcast.to(story_memberid).emit("receivestory", data);
        // redis update each stories
        redisServer.redisClient.hset("stories", data.story_id, JSON.stringify(data));
        redisServer.redisClient.hget("storyreceivers", story_memberid, function (err, messageinfo) {
          if (messageinfo != null) {
            let storyreceivers = JSON.parse(messageinfo);
            storyreceivers[data.story_id] = data;
            redisServer.redisClient.hset("storyreceivers", story_memberid, JSON.stringify(storyreceivers));
          } else {
            let storyreceivers = {};
            storyreceivers[data.story_id] = data;
            redisServer.redisClient.hset("storyreceivers", story_memberid, JSON.stringify(storyreceivers));
          }
        });
      });
      //Increment status count for user and over all count
      updateUserStatusCount(data.user_id, data.story_type);
      //Update Daily count.
      updateDailyStatusCount(data.story_type);
    }
  });

  // User story offline get, set and emit to delete.
  socket.on("storyreceived", function (data) {
    if (data.story_id != null && typeof data.story_id != "undefined" && data.user_id != null && typeof data.user_id != "undefined") {
      redisServer.redisClient.hget("storyreceivers", data.user_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let storyreceivers = JSON.parse(messageinfo);
          delete storyreceivers[data.story_id];
          redisServer.redisClient.hset("storyreceivers", data.user_id, JSON.stringify(storyreceivers));
        }
      });
    }
  });

  socket.on("deletestory", function (data) {
    if (typeof data.story_id != "undefined" && data.story_id != null && typeof data.story_members != "undefined" && data.story_members != null) {
      let memberlist = CustomizeObject(data.story_members, "member_id");
      let story_id = data.story_id;
      memberlist.forEach(function (story_memberid) {
        let deletedData = { story_id: [story_id], status: "status deleted" };
        socket.broadcast.to(story_memberid).emit("storydeleted", JSON.stringify(deletedData));
        redisServer.redisClient.hget("storyreceivers", story_memberid, function (err, messageinfo) {
          if (messageinfo != null) {
            let storyreceivers = JSON.parse(messageinfo);
            delete storyreceivers[data.story_id];
            redisServer.redisClient.hset("storyreceivers", story_memberid, JSON.stringify(storyreceivers));
          }
        });
        redisServer.redisClient.hget("storyofflinedelete", story_memberid, function (err, messageinfo) {
          if (messageinfo != null) {
            let storyofflinedelete = JSON.parse(messageinfo);
            storyofflinedelete[story_id] = data;
            redisServer.redisClient.hset("storyofflinedelete", story_memberid, JSON.stringify(storyofflinedelete));
          } else {
            let storyofflinedelete = {};
            storyofflinedelete[story_id] = data;
            redisServer.redisClient.hset("storyofflinedelete", story_memberid, JSON.stringify(storyofflinedelete));
          }
        });
      });
      redisServer.redisClient.hdel("stories", story_id);
    }
  });

  // User story delete offline to get, set and emit to delete.
  socket.on("clearofflinedeletedstrories", function (data) {
    if (data.story_id != null && typeof data.story_id != "undefined" && data.user_id != null && typeof data.user_id != "undefined") {
      redisServer.redisClient.hget("storyofflinedelete", data.user_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let storyofflinedelete = JSON.parse(messageinfo);
          delete storyofflinedelete[data.story_id];
          redisServer.redisClient.hset("storyofflinedelete", data.user_id, JSON.stringify(storyofflinedelete));
        }
      });
    }
  });

  socket.on("viewstory", function (data) {
    if (typeof data.sender_id != "undefined" && data.sender_id != null
      && typeof data.receiver_id != "undefined" && data.receiver_id != null
      && typeof data.story_id != "undefined" && data.story_id != null) {
      let datas = {
        story_id: data.story_id,
        receiver_id: data.receiver_id,
        sender_id: data.sender_id
      };
      let viewersData = { viewers: [datas] };
      io.in(data.receiver_id).emit("storyviewed", viewersData);
      redisServer.redisClient.hget("storyviewers", data.receiver_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let storyviewers = JSON.parse(messageinfo);
          storyviewers[data.story_id] = data;
          redisServer.redisClient.hset("storyviewers", data.receiver_id, JSON.stringify(storyviewers));
        } else {
          let storyviewers = {};
          storyviewers[data.story_id] = data;
          redisServer.redisClient.hset("storyviewers", data.receiver_id, JSON.stringify(storyviewers));
        }
      });
    }
  });

  // User story viewed get, set and emit to delete.
  socket.on("clearstoryviewed", function (data) {
    if (data.story_id != null && typeof data.story_id != "undefined" && data.user_id != null && typeof data.user_id != "undefined") {
      redisServer.redisClient.hget("storyviewers", data.user_id, function (err, messageinfo) {
        if (messageinfo != null) {
          let storyviewers = JSON.parse(messageinfo);
          delete storyviewers[data.story_id];
          redisServer.redisClient.hset("storyviewers", data.user_id, JSON.stringify(storyviewers));
        }
      });
    }
  });

  callLogs = function (data, reqFrom) {
    let logId = (reqFrom == "registercalls") ? data.receiver_id : data.user_id;
    redisServer.redisClient.hget("livecalls", logId.toString(), function (err, messageinfo) {
      if (messageinfo != null && !err) {
        let datas = data;
        var obj = JSON.parse(messageinfo);
        obj.missedcalls.push(datas);
        redisServer.redisClient.hset("livecalls", logId.toString(), JSON.stringify(obj));
      } else {
        let datas = [data];
        let messagedata = { missedcalls: datas };
        redisServer.redisClient.hset("livecalls", logId.toString(), JSON.stringify(messagedata));
      }
    });
  }

  // Mute Notification
  socket.on("mutechat", function (data) {
    if (data.user_id != null && typeof data.user_id != "undefined" && data.chat_id != null && typeof data.chat_id != "undefined" && data.chat_type != null && typeof data.chat_type != "undefined" && data.type != null && typeof data.type != "undefined") {
      muteUpdateDB(data.user_id, data.chat_id, data.chat_type, data.type);
    }
  });

  muteUpdateDB = function (userId, chatId, chatType, alertType) {
    let notificationData = { user_id: userId, chat_id: chatId, chat_type: chatType };
    let muteUser = new MuteNotifications(notificationData);
    if (alertType === "mute") {
      muteUser.save(function (err, result) {
        if (!err) {
          traceLog("Notification muted");
        }
      });
    } else {
      MuteNotifications.deleteMany(notificationData, function (err, result) {
        if (!err) {
          traceLog("Notification unmuted");
        }
      });
    }
  }

  traceLog = function (logText) {
    console.log(logText);
  }

  /* UPDATE User Status Count */
  let updateDailyStatusCount = function (type) {
    let thedate = new Date();
    let posted_date = thedate.setHours(0, 0, 0, 0);
    let posted_year = thedate.getFullYear();
    let posted_month = thedate.getMonth() + 1;
    let statustype = type;
    let status_image_count = 0;
    let status_video_count = 0;
    if (statustype == 'image') {
      status_image_count = 1;
      status_video_count = 0;
    }
    if (statustype == 'video') {
      status_video_count = 1;
      status_image_count = 0;
    }
    Userstatus.countDocuments({
      posted_date: posted_date,
    }, function (err, daycount) {
      if (daycount > 0) {

        Userstatus.findOneAndUpdate({
          posted_date: posted_date
        }, {
          $inc: {
            status_image_count: status_image_count,
            status_video_count: status_video_count,
          }
        }, function (err) {
          if (err) {
            consoleerror(err);
          }

        }
        );

      } else {

        let newStatus = new Userstatus({
          status_image_count: status_image_count,
          status_video_count: status_video_count,
          posted_year: posted_year,
          posted_month: posted_month,
          posted_date: posted_date
        });
        newStatus.save(function (err) {
          if (err) {
            consoleerror(err);
          }
        });


      }
    });
  };

  /* UPDATE User outgoing call Count */
  let updateUserCallCount = function (userId, type) {
    // console.log("USER CALL COUNT:" + type + "++ " + userId);
    if (type == "audio") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { call_audio_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "video") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { call_video_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    }
  };

  /* UPDATE User Status Count */
  let updateUserStatusCount = function (storyId, type) {
    if (type == "image") {
      // Update User Count 
      Users.findOneAndUpdate({
        _id: storyId
      }, {
        $inc: { status_image_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
      // Update Overall Count
      redisServer.redisClient.hincrby("statuscount", 'image', 1);

    } else if (type == "video") {
      // Update User Count 
      Users.findOneAndUpdate({
        _id: storyId
      }, {
        $inc: { status_video_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
      // Update Overall Count
      redisServer.redisClient.hincrby("statuscount", 'video', 1);
    }
  };


  /* UPDATE User Status Count */
  let updateUserChatCount = function (userId, type) {
    if (type == "image") {
      // Update User Count 
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_image_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "video") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_video_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "audio") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_audio_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "text" || type == "story") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_text_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "document") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_file_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "location") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_location_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "contact") {
      Users.findOneAndUpdate({
        _id: userId
      }, {
        $inc: { chat_contact_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    }

  };


  /* UPDATE Channel Status Count */
  let updateChannelChatCount = function (channelId, type) {
    if (type == "image") {
      // Update Channel chat Count 
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_image_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "video") {
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_video_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "audio") {
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_audio_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "text") {
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_text_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "document") {
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_file_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "location") {
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_location_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    } else if (type == "contact") {
      Userchannels.findOneAndUpdate({
        _id: channelId
      }, {
        $inc: { channel_contact_count: 1 }
      }, function (err) {
        if (err) {
          consoleerror(err);
        }
      }
      );
    }

  };

  let updateUserLiveStatus = function (userId, userStatus) {
    let userTime = new Date().toISOString();

    Users.findOneAndUpdate(
      {
        _id: userId
      },
      {
        livestatus: userStatus,
        lastseen: userTime,
      },
      function (err) {
        if (err) {
          consoleerror(err);
        }
      }
    );
  };
});

/* CUSTOMIZE YOUR JSON WITH THE OBJECT */
CustomizeObject = function getFields(input, field) {
  return input.map(function (o) {
    return o[field];
  });
};

/* CONSOLE ERROR MESSAGES */
consoleerror = function (err) {
  console.log("ERROR CONSOLE: " + err);
};

/* GROUP INVITATIONS */
let groupInvitations = function (group_memberid, groupdata) {
  let new_invites = { group_id: groupdata._id, group_image: groupdata.group_image, invited_at: moment().toISOString() };
  redisServer.redisClient.hget("groupinvites", group_memberid, function (err, messageinfo) {
    if (messageinfo != null) {
      let groupinvites = JSON.parse(messageinfo);
      groupinvites[groupdata._id] = groupdata;
      redisServer.redisClient.hset("groupinvites", group_memberid, JSON.stringify(groupinvites));
    } else {
      let groupinvites = {};
      groupinvites[groupdata._id] = groupdata;
      redisServer.redisClient.hset("groupinvites", group_memberid, JSON.stringify(groupinvites));
    }
  });
};

/* CHANNEL INVITATIONS */
let channelInvitations = function (subscriber_id, channeldata) {
  redisServer.redisClient.hget("userchannelinvites", subscriber_id, function (err, messageinfo) {
    if (messageinfo != null) {
      let userchannelinvites = JSON.parse(messageinfo);
      userchannelinvites[channeldata._id] = channeldata;
      redisServer.redisClient.hset("userchannelinvites", subscriber_id, JSON.stringify(userchannelinvites));
    } else {
      let userchannelinvites = {};
      userchannelinvites[channeldata._id] = channeldata;
      redisServer.redisClient.hset("userchannelinvites", subscriber_id, JSON.stringify(userchannelinvites));
    }
  });
};

module.exports = {
  chatservice: chatservice,
  io: io
};