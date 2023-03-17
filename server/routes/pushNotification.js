const axios = require('axios').default;
require('dotenv').config();
const apn = require("apn");

/* MODELS */
let Sitesettings = require("../models/sitesettingModel");
let UserDevices = require("../models/userdeviceModel");
let translationServer = require("../translation/translate.js");

/* COMPOSE PUSH NOTIFICATIONS */
sendNotification = function (member, message, data) {
  UserDevices.findOne({
    user_id: member
  }).exec(function (err, chatdevices) {
    if (chatdevices && !err) {
      if (chatdevices.device_type == 0) {
        sendIos(chatdevices.apns_token, message, data, 'user', chatdevices.lang_type);
      } else {
        if (typeof chatdevices.onesignal_id != "undefined" && chatdevices.onesignal_id != null) {
          sendAndroid(chatdevices.onesignal_id, data, "single");
        }
      }
    }
  });
};

/* COMPOSE CALL NOTIFICATIONS */
callNotification = function (member, message, data) {
  UserDevices.findOne({
    user_id: member
  }).sort({ "_id": -1 }).exec(function (err, chatdevices) {
    if (chatdevices && !err) {
      if (typeof chatdevices.device_token != "undefined" && chatdevices.device_token != null) {
        if (chatdevices.device_type == 0) {
          callIos(chatdevices.device_token,message,data,chatdevices.device_mode);
        } else {
          callAndroid(member, data, "single");
        }
      }
    }
  });
};

/* COMPOSE MULTI PUSH NOTIFICATIONS */
sendNotifications = function (members, message, data) {
  // send ios notifications 
  UserDevices.find({
    device_type: "0"
  })
    .where("user_id")
    .in(members)
    .exec(function (err, records) {
      let sendnotifications = [];
      if (records != "" && typeof records != "undefined") {
        records.forEach(function (rec) {
          sendIos(rec.apns_token, message, data, 'user', rec.lang_type);
        });
      }
    });
  // send android notifications 
  UserDevices.find({
    device_type: "1"
  })
    .where("user_id")
    .in(members)
    .exec(function (err, records) {
      let sendnotifications = [];
      if (records != "" && typeof records != "undefined") {
        records.forEach(function (rec) {
          sendnotifications.push(rec.onesignal_id);
        });
        sendAndroid(sendnotifications, data, "multiple");
      }
    });
};

/* COMPOSE ADMIN PUSH NOTIFICATIONS */
sendAdminNotifications = function (message, data) {
  // send ios notifications 
  UserDevices.find({
    device_type: "0"
  }).exec(function (err, records) {
    let sendnotifications = [];
    if (records != "" && typeof records != "undefined") {
      records.forEach(function (rec) {
        sendIos(rec.apns_token, message, data, 'admin', rec.lang_type);
      });
    }
  });
  // send android notifications 
  UserDevices.find({
    device_type: "1"
  }).exec(function (err, records) {
    if (records != "" && typeof records != "undefined") {
      let sendnotifications = [];
      records.forEach(function (rec) {
        sendnotifications.push(rec.onesignal_id);
      });
      sendAndroid(sendnotifications, data, "multiple");
    }
  });
};

/* iOS PUSH NOTIFICTIONS */
callIos = function (devicetoken, message, message_data, mode) {
  Sitesettings.findOne(function (err, sitedata) {
    let apns_passphrase = sitedata.voip_passpharse;
    if (typeof apns_passphrase != "undefined" && apns_passphrase != null) {
      let options = {};
      // options.cert = __dirname + "/apns_live/ck.pem";
      // options.key = __dirname + "/apns_live/ck.pem";

      options.cert = __dirname + "/apns/cert.pem";
      options.key = __dirname + "/apns/key.pem";

      options.passphrase = "123456";
      options.production = false;
      if (mode == "1") {
        options.production = true;
      }
      let apnProvider = new apn.Provider(options);
      let notification = new apn.Notification();
      notification.payload = message_data;
      notification.sound = "ping.aiff";
      notification.badge = 1;
      notification.alert = message;
      apnProvider.send(notification, devicetoken).then(result => {
        console.log("iOS Pushnotification log" + JSON.stringify(result));
      });
    }
  });
};

/* ANDROID FCM PUSH NOTIFICATIONS */
sendAndroid = function (devicetokens, data, notify_mode) {
  Sitesettings.findOne(function (err, sitedata) {
    if (typeof sitedata.fcm_key != "undefined" && sitedata.fcm_key != null) {
      let messageData = {
        app_id: sitedata.fcm_key,
        contents: { "en": "APP" },
        include_player_ids: (notify_mode === "single") ? [devicetokens] : devicetokens,
        priority: 10,
        data: data
      };
      axios({
        method: 'POST',
        url: 'https://onesignal.com/api/v1/notifications',
        responseType: 'json',
        responseEncoding: 'utf8',
        data: messageData,
      }).then(function (response) {
        /* console.log("Android Pushnotification log" + JSON.stringify(response.data)); */
      });
    }
  });
};

sendIos = function(devicetokens, messagetext, data,type,lang) {
  let decryptedString =messagetext;
  let threadid = "";
  let categoryid = "";
  let msgtitle = "";
  let unreadcount = 1;
  let options = {};
  if(data.message_data.message_type == "text" || data.message_data.message_type == "gif" || data.message_data.message_type == "story" || data.message_data.message_type == "isDelete")
  {
    const key = "Hiddy123!@#";
    const cryptLib = require('@skavinvarnan/cryptlib');
    if(type == "user"){
      decryptedString = cryptLib.decryptCipherTextWithRandomIV(messagetext, key);
    }
    else
    {
      decryptedString = messagetext;
    }
  }
  else
  {
    decryptedString = translationServer.langTranslate(data.message_data.message_type,lang);
  }
  if(data.message_data.chat_type == "channel")
  {
    threadid = data.message_data.channel_id;
    categoryid = "channel:"+data.message_data.channel_id;
    msgtitle = data.message_data.channel_name;
  }
  else if(data.message_data.chat_type == "groupinvitation"){
    threadid = "groupinvitation:"+data.message_data.id;
    categoryid = "groupinvitation:"+data.message_data.id;
    decryptedString = translationServer.langTranslate("Youaddedtothisgroup",lang);
    msgtitle = data.message_data.title;
  }
  else if(data.message_data.chat_type == "channelinvitation"){
    threadid ="channelinvitation:"+data.message_data.id;
    categoryid = "channelinvitation:"+data.message_data.id;
    decryptedString = translationServer.langTranslate("Yougotaninvitationfromchannel",lang);
    msgtitle = data.message_data.title;
  }
  else
  {
    if(data.message_data.chat_type == "single"){
      threadid = data.message_data.sender_id;
      categoryid = "single:"+data.message_data.sender_id;
      msgtitle = data.sender_name;
    }
    else
    {
      threadid = data.message_data.group_id;
      categoryid = "group:"+data.message_data.group_id;
      msgtitle = data.message_data.group_name;
    }
  }
  UserDevices.findOneAndUpdate(
  {
    apns_token: devicetokens
  },
  {
    $inc: { 
      unread_count: unreadcount,
    }
  }
  ).exec(function(err, userdevices) {
    if (err) {
      /*console.log(err);*/
    } else {
      badgevalue = userdevices.unread_count;
      if(userdevices.device_mode== "1"){
        options = {
          token: {
            key: __dirname + process.env.APNS_KEY,
            keyId: process.env.APNS_KEYID,
            teamId: process.env.APNS_TEAMID
          },
            production: true
          };
        }
        else
        {
          options = {
            token: {
              key: __dirname + process.env.APNS_KEY,
              keyId: process.env.APNS_KEYID,
              teamId: process.env.APNS_TEAMID
            },
              production: false
            };
          }
          let apnProvider = new apn.Provider(options);
          let deviceToken = devicetokens;
          let notification = new apn.Notification();
          notification.topic = process.env.IOS_BUNDLE_ID;
          notification.rawPayload = {
            "from":"node-apn",
            "source":"web",
            "aps":{
              "content-available":1,
              "mutable-content": 1,
              "badge":1,
              "priority":10,
              "alert":"iOS",
              "threadId":threadid,
              "category":categoryid,
              "sound":"default",
              "title": msgtitle,
            },
            "data":{
              "title": msgtitle,
              "body": decryptedString,
              "message_data":data.message_data,
            }
          };        
          apnProvider.send(notification, deviceToken).then( result => {
            console.log("iOS Pushnotification log" + JSON.stringify(result));
          });
          apnProvider.shutdown();
        }
      }); 
}

/* ANDROID CALL NOTIFICATIONS */
callAndroid = function (userId, data, notify_mode) {
  Sitesettings.findOne(function (err, sitedata) {
    if (typeof sitedata.fcm_key != "undefined" && sitedata.fcm_key != null) {
      UserDevices.findOne({ "user_id": userId }, function (err, userdata) {
        if (userdata) {
          if (userdata.onesignal_id) {
            let messageData = {
              app_id: sitedata.fcm_key,
              contents: { "en": "App" },
              include_player_ids: [userdata.onesignal_id],
              priority: 10,
              ttl: data.ttl,
              data: data
            };
            axios({
              method: 'POST',
              url: 'https://onesignal.com/api/v1/notifications',
              responseType: 'json',
              responseEncoding: 'utf8',
              data: messageData,
            }).then(function (response) {
              /* console.log("Android Pushnotification log" + JSON.stringify(response.data)); */
            });
          }
        }
      });
    }
  });
};

module.exports = {
  sendIos: sendIos,
  callIos: callIos,
  sendAndroid: sendAndroid,
  sendNotification: sendNotification,
  sendNotifications: sendNotifications,
  sendAdminNotifications: sendAdminNotifications,
  callNotification: callNotification
};