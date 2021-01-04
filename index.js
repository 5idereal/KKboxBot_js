const express = require('express');
const line = require('@line/bot-sdk');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const { config, kkbox_token } = require('./config.json');
const { helpresponse, test, fallbackmsg } = require('./help.json');
const axios = require('axios'); //todo: change back to fetch
const { response } = require('express');
const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});
const client = new line.Client(config);
const sessionId = uuid.v4();
const projectId = 'discordbot-268311';
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: 'zh-TW',
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  switch (responses[0].queryResult.intent['displayName']) {
    case "Search": search(responses[0].queryResult.parameters.fields.searchparameter.stringValue, event.replyToken); break;
    case "New": newhit(event.replyToken); break;
    case "Help": help(event.replyToken); break;
    case "Hot": chart(event.replyToken); break;
    case "Top_tracks": break;
    case "Mood": mood(event.replyToken); break;
    case "Session": session(event.replyToken); break;
    case "Featured": featured(event.replyToken); break;
    case "Chnew": chnewhit('DZrC8m29ciOFY2JAm3', '華語', event.replyToken); break;
    case "JPnew": chnewhit('1_pCwOnj-qZsGU3rTJ', '日語', event.replyToken); break;
    case "KRnew": chnewhit('0kM_Sp_Ezou3BMGK-n', '韓語', event.replyToken); break;
    case "Ennew": chnewhit('DZni8m29ciOFbRxTJq', '西洋', event.replyToken); break;
    case "CHhot": chartlist('P_URMIExa4XsT7kGp0', '華語', event.replyToken); break;
    case "JPhot": chartlist('5XkOvYUtCAvDHZUcB6', '日語', event.replyToken); break;
    case "KRhot": chartlist('SnDyZf9t7HAaYBEb-M', '韓語', event.replyToken); break;
    case "Enhot": chartlist('HZrfrgizzAH66d1eQA', '西洋', event.replyToken); break;
    case "TWhot": chartlist('HZrfrgizzAH66d1eQA', '台語', event.replyToken); break;
    case "albumsearch": album(responses[0].queryResult.parameters.fields['any'].stringValue, event.replyToken); break;
    case "artistsearch": artist(responses[0].queryResult.parameters.fields['any'].stringValue, event.replyToken); break;
    case "moodsearch": moodsearch(responses[0].queryResult.parameters.fields['any'].stringValue, event.replyToken); break;
    case "radiosearch": radiosearch(responses[0].queryResult.parameters.fields['any'].stringValue, event.replyToken); break;
    case "Radio": radio(event.replyToken); break;
    case "Fallback": fallback(event.replyToken); break;
    case "FeaturedPlaylist": featuredplaylist(event.replyToken); break;
    case "featuredsearch": featuredplaylistsearch(responses[0].queryResult.parameters.fields['any'].stringValue,event.replyToken); break;
    case "newrelease": newrelease(event.replyToken); break;
  }
}

function search(text, token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/search?q=' + text + '&territory=TW&limit=10'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let tracks = [];
    let artists = [];
    let albums = [];
    for (const val of response.data.tracks.data) {
      var aa =
      {
        "type": "bubble",
        "size": "kilo",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.album.images[0].url.replace(/160x160/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "7:2",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": val.name.split('(')[0],
                      "size": "xl",
                      "color": "#ffffff",
                      "weight": "bold",
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(val.duration),
                      "color": "#FFFFFFCC",
                      "align": "end",
                      "weight": "regular",
                      "offsetEnd": "5px",
                      "flex": 2
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "By " + val.album.artist.name.split('(')[0] + "In " + val.album.name.split('(')[0],
                      "color": "#ebebeb",
                      "size": "sm",
                      "flex": 0
                    }
                  ],
                  "spacing": "sm",
                  "paddingTop": "5px"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000080",
              "paddingAll": "18px",
              "paddingTop": "10px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://widget.kkbox.com/v1/?id=" + val.id + "&type=song&terr=TW&lang=TC&autoplay=false&loop=false"
          }
        }
      }
      tracks.push(aa);
    }
    for (const val of response.data.artists.data) {
      var aa = {
        "type": "bubble",
        "size": "nano",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url.replace(/300x300/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "1:1"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": val.name.split('(')[0],
                  "size": "md",
                  "color": "#ffffff",
                  "weight": "bold"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "background": {
                "type": "linearGradient",
                "angle": "0deg",
                "startColor": "#000000CC",
                "endColor": "#00000000"
              },
              "paddingAll": "14px"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "message",
            "label": "action",
            "text": "artist " + val.id
          }
        }
      }
      artists.push(aa);
    }
    for (const val of response.data.albums.data) {
      var aa = {
        "type": "bubble",
        "size": "micro",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url.replace(/300x300/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "1:1"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": val.name.split('(')[0],
                      "size": "md",
                      "color": "#ffffff",
                      "weight": "bold"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": val.artist.name.split('(')[0],
                      "color": "#ebebeb",
                      "size": "sm"
                    }
                  ],
                  "paddingTop": "3px"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "paddingAll": "10px",
              "height": "41%",
              "background": {
                "type": "linearGradient",
                "angle": "0deg",
                "startColor": "#000000CC",
                "endColor": "#00000000"
              }
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "message",
            "label": "action",
            "text": "album " + val.id
          }
        }
      }
      albums.push(aa);
    }
    client.replyMessage(token, [{
      "type": "flex",
      "altText": "選擇你想要的類別",
      "contents": {
        "type": "carousel",
        "contents": tracks
      }
    }, {
      "type": "flex",
      "altText": "選擇你想要的類別",
      "contents": {
        "type": "carousel",
        "contents": artists
      }
    }, {
      "type": "flex",
      "altText": "選擇你想要的類別",
      "contents": {
        "type": "carousel",
        "contents": albums
      }
    }])
  })
}
function newhit(token) {
  client.replyMessage(token, [{
    "type": "text",
    "text": "你想看哪個排行榜呢？"
  }, {
    "type": "flex",
    "altText": "選擇你想要的類別",
    "contents": {
      "type": "carousel",
      "contents": [
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://africa.cgtn.com/wp-content/photo-gallery/2019/02/China.png",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "華語",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看華語新歌排行"
          }
        },
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://www.s-ge.com/sites/default/files/company/images/USA-Fotolia_23428736-LUSA_NW-rabbit75_fot-75428.jpg",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "西洋",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看西洋新歌排行"
          }
        },
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/16/a6/88/con-la-primavera-in-giappone.jpg?w=1000&h=600&s=1",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "日語",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看日語新歌排行"
          }
        },
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://i.guim.co.uk/img/media/00d5acc5100c133b5063fb79d76eac045b283581/0_262_4500_2700/master/4500.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d27f6e6aa4ba39ce4e8c478d1f3cc4d5",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "韓語",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看韓語新歌排行"
          }
        }
      ]
    }
  }])
}
function chnewhit(id, name, token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/new-hits-playlists/' + id + '?territory=TW&limit=11'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    client.replyMessage(token, {
      "type": "flex", "altText": "hit", "contents": {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": response.data.images[0].url.replace(/300x300/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "8:11",
              "gravity": "center"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": name + "新歌排行",
                  "size": "xl",
                  "color": "#FFFFFF",
                  "weight": "bold"
                },
                {
                  "type": "separator",
                  "margin": "md"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "1",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[0].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[0].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "2",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[1].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[1].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "3",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[2].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[2].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "4",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[3].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[3].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "5",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[4].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[4].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "6",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[5].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[5].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "7",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[6].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[6].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "size": "sm",
                          "align": "end",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "8",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[7].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[7].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "size": "sm",
                          "align": "end",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "9",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[8].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[8].album.artist.name.split('(')[0],
                          "flex": 3,
                          "size": "sm",
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "10",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[9].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[9].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "size": "sm",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "button",
                          "action": {
                            "type": "uri",
                            "label": "試聽",
                            "uri": "https://widget.kkbox.com/v1/?id=" + id + "&type=playlist&terr=TW&lang=TC&autoplay=false&loop=false"
                          },
                          "color": "#FFFFFF",
                          "height": "sm"
                        }
                      ],
                      "borderWidth": "normal",
                      "borderColor": "#FFFFFF",
                      "cornerRadius": "lg",
                      "margin": "xl"
                    }
                  ],
                  "margin": "lg"
                }
              ],
              "position": "absolute",
              "background": {
                "type": "linearGradient",
                "angle": "0deg",
                "endColor": "#000000AA",
                "startColor": "#000000BB"
              },
              "width": "100%",
              "height": "100%",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "paddingAll": "18px"
            }
          ],
          "paddingAll": "0px"
        }
      }
    })
  });
}
function chart(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/charts?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    console.log(response.data);
  })
  client.replyMessage(token, [{
    "type": "text",
    "text": "你想看哪個排行榜呢？"
  }, {
    "type": "flex",
    "altText": "選擇你想要的類別",
    "contents": {
      "type": "carousel",
      "contents": [
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://africa.cgtn.com/wp-content/photo-gallery/2019/02/China.png",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "華語",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看華語熱門排行"
          }
        },
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://www.s-ge.com/sites/default/files/company/images/USA-Fotolia_23428736-LUSA_NW-rabbit75_fot-75428.jpg",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "西洋",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看西洋熱門排行"
          }
        },
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/16/a6/88/con-la-primavera-in-giappone.jpg?w=1000&h=600&s=1",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "日語",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看日語熱門排行"
          }
        },
        {
          "type": "bubble",
          "size": "micro",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "image",
                "url": "https://i.guim.co.uk/img/media/00d5acc5100c133b5063fb79d76eac045b283581/0_262_4500_2700/master/4500.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d27f6e6aa4ba39ce4e8c478d1f3cc4d5",
                "size": "full",
                "aspectMode": "cover",
                "aspectRatio": "1:1"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [],
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "backgroundColor": "#00000035"
              },
              {
                "type": "text",
                "text": "韓語",
                "position": "absolute",
                "color": "#FFFFFF",
                "size": "4xl",
                "weight": "bold",
                "offsetTop": "30%",
                "offsetStart": "20%"
              }
            ],
            "paddingAll": "0px"
          },
          "action": {
            "type": "message",
            "label": "action",
            "text": "我想看韓語熱門排行"
          }
        }
      ]
    }
  }])
}
function chartlist(id, name, token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/charts/' + id + '?territory=TW&limit=11'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    client.replyMessage(token, {
      "type": "flex", "altText": "hit", "contents": {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": response.data.images[0].url.replace(/300x300/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "8:11",
              "gravity": "center"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": name + "熱門排行",
                  "size": "xl",
                  "color": "#FFFFFF",
                  "weight": "bold"
                },
                {
                  "type": "separator",
                  "margin": "md"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "1",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[0].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[0].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "2",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[1].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[1].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "3",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[2].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[2].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "4",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[3].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[3].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "5",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[4].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[4].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "6",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[5].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[5].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center",
                          "size": "sm"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "7",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[6].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[6].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "size": "sm",
                          "align": "end",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "8",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[7].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[7].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "size": "sm",
                          "align": "end",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "9",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[8].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[8].album.artist.name.split('(')[0],
                          "flex": 3,
                          "size": "sm",
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "10",
                          "color": "#FFFFFF",
                          "align": "center"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[9].name.split('(')[0],
                          "flex": 6,
                          "color": "#FFFFFF",
                          "weight": "bold"
                        },
                        {
                          "type": "text",
                          "text": response.data.tracks.data[9].album.artist.name.split('(')[0],
                          "flex": 3,
                          "color": "#FFFFFFCC",
                          "align": "end",
                          "size": "sm",
                          "gravity": "center"
                        }
                      ],
                      "margin": "sm"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "button",
                          "action": {
                            "type": "uri",
                            "label": "試聽",
                            "uri": "https://widget.kkbox.com/v1/?id=" + id + "&type=playlist&terr=TW&lang=TC&autoplay=false&loop=false"
                          },
                          "color": "#FFFFFF",
                          "height": "sm"
                        }
                      ],
                      "borderWidth": "normal",
                      "borderColor": "#FFFFFF",
                      "cornerRadius": "lg",
                      "margin": "xl"
                    }
                  ],
                  "margin": "lg"
                }
              ],
              "position": "absolute",
              "background": {
                "type": "linearGradient",
                "angle": "0deg",
                "endColor": "#000000AA",
                "startColor": "#000000BB"
              },
              "width": "100%",
              "height": "100%",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "paddingAll": "18px"
            }
          ],
          "paddingAll": "0px"
        }
      }
    })
  });
}
function featured(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/featured-playlists?territory=TW&limit=11'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    for (const val of response.data.data) {
      var aa = {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url.replace(/300x300/g, "900x900"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "4:1",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "size": "xl",
                      "color": "#ffffff",
                      "weight": "bold",
                      "text": val.title
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "by " + val.owner.name,
                      "color": "#ebebeb",
                      "size": "sm",
                      "flex": 0
                    }
                  ],
                  "spacing": "lg",
                  "margin": "sm"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000050",
              "paddingTop": "15px",
              "paddingAll": "18px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://widget.kkbox.com/v1/?id=" + val.id + "&type=playlist&terr=TW&lang=TC&autoplay=false&loop=false"
          }
        },
        "size": "giga"
      }
      a.push(aa);
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  })
}
/*只有六個歌單*/
function session(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/session-playlists?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    for (const val of response.data.data) {
      var aa = {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url.replace(/300x300/g, "900x900"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "4:1",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "size": "xl",
                      "color": "#ffffff",
                      "weight": "bold",
                      "text": val.title
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "by " + val.owner.name,
                      "color": "#ebebeb",
                      "size": "sm",
                      "flex": 0
                    }
                  ],
                  "spacing": "lg",
                  "margin": "sm"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000050",
              "paddingTop": "15px",
              "paddingAll": "18px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://widget.kkbox.com/v1/?id=" + val.id + "&type=playlist&terr=TW&lang=TC&autoplay=false&loop=false"
          }
        },
        "size": "giga"
      }
      a.push(aa);
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  })
}
function help(token) {
  client.replyMessage(token, helpresponse);
}
function fallback(token) {
  client.replyMessage(token, fallbackmsg);
}
function artist(id, token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/artists/' + id + '?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response1 => {
    axios.get('https://api.kkbox.com/v1.1/artists/' + id + '/albums?territory=TW', { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response2 => {
      axios.get('https://api.kkbox.com/v1.1/artists/' + id + '/top-tracks?territory=TW', { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response3 => {
        axios.get('https://api.kkbox.com/v1.1/artists/' + id + '/related-artists?territory=TW', { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response4 => {
          console.log(response1.data);
          let a = [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "熱門歌曲",
                  "weight": "bold"
                },
                {
                  "type": "separator",
                  "margin": "5px"
                },
                {
                  "type": "separator",
                  "margin": "5px",
                  "color": "#FFFFFF"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "1",
                      "flex": 1,
                      "align": "center",
                      "size": "sm",
                      "gravity": "center",
                      "color": "#999999"
                    },
                    {
                      "type": "text",
                      "text": response3.data.data[0].name.split('(')[0],
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(response3.data.data[0].duration),
                      "flex": 2,
                      "align": "end",
                      "color": "#999999"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "2",
                      "flex": 1,
                      "align": "center",
                      "size": "sm",
                      "gravity": "center",
                      "color": "#999999"
                    },
                    {
                      "type": "text",
                      "text": response3.data.data[1].name.split('(')[0],
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(response3.data.data[1].duration),
                      "flex": 2,
                      "align": "end",
                      "color": "#999999"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "3",
                      "flex": 1,
                      "align": "center",
                      "size": "sm",
                      "gravity": "center",
                      "color": "#999999"
                    },
                    {
                      "type": "text",
                      "text": response3.data.data[2].name.split('(')[0],
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(response3.data.data[2].duration),
                      "flex": 2,
                      "align": "end",
                      "color": "#999999"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "4",
                      "flex": 1,
                      "align": "center",
                      "size": "sm",
                      "gravity": "center",
                      "color": "#999999"
                    },
                    {
                      "type": "text",
                      "text": response3.data.data[3].name.split('(')[0],
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(response3.data.data[3].duration),
                      "flex": 2,
                      "align": "end",
                      "color": "#999999"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "5",
                      "flex": 1,
                      "align": "center",
                      "size": "sm",
                      "gravity": "center",
                      "color": "#999999"
                    },
                    {
                      "type": "text",
                      "text": response3.data.data[4].name.split('(')[0],
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(response3.data.data[4].duration),
                      "flex": 2,
                      "align": "end",
                      "color": "#999999"
                    }
                  ]
                }
              ]
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "最新專輯",
                  "weight": "bold",
                  "margin": "none"
                },
                {
                  "type": "separator",
                  "margin": "5px"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "image",
                          "url": response2.data.data.slice(-1)[0].images[0].url,
                          "aspectRatio": "1:1",
                          "size": "full",
                          "aspectMode": "cover"
                        },
                        {
                          "type": "text",
                          "text": response2.data.data.slice(-1)[0].name,
                          "size": "sm",
                          "align": "center"
                        }
                      ],
                      "action": {
                        "type": "message",
                        "label": "action",
                        "text": "album " + response2.data.data.slice(-1)[0].id
                      }
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "image",
                          "url": response2.data.data.slice(-2)[0].images[0].url,
                          "aspectRatio": "1:1",
                          "size": "full",
                          "aspectMode": "cover"
                        },
                        {
                          "type": "text",
                          "text": response2.data.data.slice(-2)[0].name,
                          "size": "sm",
                          "align": "center"
                        }
                      ],
                      "action": {
                        "type": "message",
                        "label": "action",
                        "text": "album " + response2.data.data.slice(-2)[0].id
                      }
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "image",
                          "url": response2.data.data.slice(-3)[0].images[0].url,
                          "aspectRatio": "1:1",
                          "size": "full",
                          "aspectMode": "cover"
                        },
                        {
                          "type": "text",
                          "text": response2.data.data.slice(-3)[0].name,
                          "size": "sm",
                          "align": "center"
                        }
                      ],
                      "action": {
                        "type": "message",
                        "label": "action",
                        "text": "album " + response2.data.data.slice(-3)[0].id
                      }
                    }
                  ],
                  "spacing": "sm",
                  "margin": "md"
                }
              ],
              "margin": "md"
            }
          ];
          if (response4.data.data.length != 0) {
            a.push(
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "相關歌手",
                    "weight": "bold",
                    "margin": "none"
                  },
                  {
                    "type": "separator",
                    "margin": "5px"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                              {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                  {
                                    "type": "image",
                                    "url": response4.data.data[0].images[0].url,
                                    "aspectRatio": "1:1",
                                    "size": "full",
                                    "aspectMode": "cover"
                                  }
                                ],
                                "cornerRadius": "200px"
                              },
                              {
                                "type": "text",
                                "text": response4.data.data[0].name.split('(')[0],
                                "size": "xs",
                                "align": "center"
                              }
                            ]
                          }
                        ],
                        "spacing": "sm",
                        "margin": "md",
                        "action": {
                          "type": "message",
                          "label": "action",
                          "text": "artist " + response4.data.data[0].id
                        }
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                              {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                  {
                                    "type": "image",
                                    "url": response4.data.data[1].images[0].url,
                                    "aspectRatio": "1:1",
                                    "size": "full",
                                    "aspectMode": "cover"
                                  }
                                ],
                                "cornerRadius": "200px"
                              },
                              {
                                "type": "text",
                                "text": response4.data.data[1].name.split('(')[0],
                                "size": "xs",
                                "align": "center"
                              }
                            ]
                          }
                        ],
                        "spacing": "sm",
                        "margin": "md",
                        "action": {
                          "type": "message",
                          "label": "action",
                          "text": "artist " + response4.data.data[1].id
                        }
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                              {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                  {
                                    "type": "image",
                                    "url": response4.data.data[2].images[0].url,
                                    "aspectRatio": "1:1",
                                    "size": "full",
                                    "aspectMode": "cover"
                                  }
                                ],
                                "cornerRadius": "200px"
                              },
                              {
                                "type": "text",
                                "text": response4.data.data[2].name.split('(')[0],
                                "size": "xs",
                                "align": "center"
                              }
                            ]
                          }
                        ],
                        "spacing": "sm",
                        "margin": "md",
                        "action": {
                          "type": "message",
                          "label": "action",
                          "text": "artist " + response4.data.data[2].id
                        }
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                              {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                  {
                                    "type": "image",
                                    "url": response4.data.data[3].images[0].url,
                                    "aspectRatio": "1:1",
                                    "size": "full",
                                    "aspectMode": "cover"
                                  }
                                ],
                                "cornerRadius": "200px"
                              },
                              {
                                "type": "text",
                                "text": response4.data.data[3].name.split('(')[0],
                                "size": "xs",
                                "align": "center"
                              }
                            ]
                          }
                        ],
                        "spacing": "sm",
                        "margin": "md",
                        "action": {
                          "type": "message",
                          "label": "action",
                          "text": "artist " + response4.data.data[3].id
                        }
                      }
                    ],
                    "spacing": "sm",
                    "margin": "md"
                  }
                ],
                "margin": "md"
              })
          }
          client.replyMessage(token, {
            "type": "flex",
            "altText": "artist",
            "contents": {
              "type": "carousel",
              "contents": [
                {
                  "type": "bubble",
                  "size": "giga",
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "image",
                        "url": response1.data.images[0].url,
                        "size": "full",
                        "aspectMode": "cover",
                        "aspectRatio": "11:2",
                        "gravity": "top"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": response1.data.name,
                            "size": "xl",
                            "color": "#ffffff",
                            "weight": "bold"
                          }
                        ],
                        "position": "absolute",
                        "offsetStart": "0px",
                        "offsetEnd": "0px",
                        "backgroundColor": "#00000077",
                        "paddingAll": "20px"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": a,
                        "paddingAll": "20px"
                      }
                    ],
                    "paddingAll": "0px"
                  }
                }
              ]
            }

          })
        });
      });
    });
  });
}
function album(id, token) {
  let a = [];
  let times = 1;
  axios.get(encodeURI('https://api.kkbox.com/v1.1/albums/' + id + '?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response1 => {
    axios.get(encodeURI('https://api.kkbox.com/v1.1/albums/' + id + '/tracks?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response2 => {
      for (const val of response2.data.data) {
        var aa = {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": "" + times,
              "align": "center",
              "color": "#FFFFFFCC",
              "size": "xs",
              "gravity": "center"
            },
            {
              "type": "text",
              "text": val.name,
              "color": "#FFFFFF",
              "flex": 8,
              "weight": "bold",
              "size": "sm",
              "gravity": "center"
            },
            {
              "type": "text",
              "text": millisToMinutesAndSeconds(val.duration),
              "color": "#FFFFFFCC",
              "flex": 2,
              "align": "end",
              "style": "normal",
              "size": "xs",
              "gravity": "center"
            }
          ]
        }
        times += 1;
        a.push(aa);
      }
      client.replyMessage(token, {
        "type": "flex",
        "altText": "track",
        "contents": {
          "type": "bubble",
          "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "image",
                    "url": response1.data.images[0].url.replace(/300x300/g, "600x600"),
                    "size": "full",
                    "aspectMode": "cover",
                    "aspectRatio": "2:1"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": response1.data.name,
                    "color": "#FFFFFF",
                    "size": "xl",
                    "weight": "bold"
                  },
                  {
                    "type": "text",
                    "text": response1.data.artist.name.split('(')[0] + " · " + response1.data.release_date + " · " + response2.data.data.length + "首歌",
                    "color": "#FFFFFF",
                    "size": "sm"
                  }
                ],
                "position": "absolute",
                "width": "100%",
                "height": "100%",
                "background": {
                  "type": "linearGradient",
                  "angle": "0deg",
                  "startColor": "#00000099",
                  "endColor": "#ffffff00"
                },
                "justifyContent": "flex-end",
                "paddingAll": "10px"
              }
            ],
            "paddingAll": "0px",
            "action": {
              "type": "uri",
              "label": "action",
              "uri": "https://google.com"
            }
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": a,
            "paddingAll": "15px",
            "backgroundColor": "#5d85b0"
          }
        }
      })
    });
  });
}
function radio(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/radio-categories?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    let i = 1;
    for (const val of response.data.data) {
      var aa =
      {
        "type": "bubble",
        "size": "nano",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": val.title,
              "size": "md",
              "weight": "bold",
              "align": "center"
            }
          ],
          "backgroundColor": getRandomColor(),
          "action": {
            "type": "message",
            "label": "action",
            "text": "radio " + val.id
          }
        }
      }
      if (i == 11) {
        break;
      } else {
        i++;
      }
      a.push(aa);
    }
    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  });
}
function radiosearch(id, token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/radio-categories/' + id + '/tracks?territory=TW&limit=11'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    for (const val of response.data.data) {
      var aa = {
        "type": "bubble",
        "size": "kilo",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.album.images[0].url.replace(/160x160/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "7:2",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": val.name.split('(')[0],
                      "size": "xl",
                      "color": "#ffffff",
                      "weight": "bold",
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(val.duration),
                      "color": "#FFFFFFCC",
                      "align": "end",
                      "weight": "regular",
                      "offsetEnd": "5px",
                      "flex": 2
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "By " + val.album.artist.name.split('(')[0] + "In " + val.album.name.split('(')[0],
                      "color": "#ebebeb",
                      "size": "sm",
                      "flex": 0
                    }
                  ],
                  "spacing": "sm",
                  "paddingTop": "5px"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000080",
              "paddingAll": "18px",
              "paddingTop": "10px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://widget.kkbox.com/v1/?id=" + val.id + "&type=song&terr=TW&lang=TC&autoplay=false&loop=false"
          }
        }
      }
      a.push(aa);
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  })
}
/*親子*/
/*function children(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/children-categories?territory=TW&limits=10'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    client.replyMessage(token, test)
    console.log(response.data.data);
  });
}*/
function featuredplaylist(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/featured-playlist-categories?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    let i=1;
    for (const val of response.data.data) {
      var aa = {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url,
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "4:1",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "size": "lg",
                      "color": "#ffffff",
                      "weight": "bold",
                      "text": val.title,
                      "align": "center",
                      "gravity": "center"
                    }
                  ]
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000050",
              "paddingTop": "5px",
              "paddingAll": "5px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "message",
            "label": "action",
            "text": "featured " + val.id
          }
        },
        "size": "micro"
      }
      if(i==11){
        break;
      }else{
        i++;
      }
      a.push(aa);
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  });
}
function featuredplaylistsearch(id,token){
  axios.get(encodeURI('https://api.kkbox.com/v1.1/featured-playlist-categories/' + id + '?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    let i=0;
    for (const val of response.data.playlists.data) {
      var aa = {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url.replace(/300x300/g, "900x900"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "4:1",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "size": "xl",
                      "color": "#ffffff",
                      "weight": "bold",
                      "text": val.title
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "by " + val.owner.name,
                      "color": "#ebebeb",
                      "size": "sm",
                      "flex": 0
                    }
                  ],
                  "spacing": "lg",
                  "margin": "sm"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000050",
              "paddingTop": "15px",
              "paddingAll": "18px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://widget.kkbox.com/v1/?id=" + val.id + "&type=playlist&terr=TW&lang=TC&autoplay=false&loop=false"
          }
        },
        "size": "giga"
      }
      if(i==11){
        break;
      }else{
        i++;
      }
      a.push(aa);
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
  })
});
}
function newrelease(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/new-release-categories?territory=TW&limits=10'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    let i = 1;
    for (const val of response.data.data) {
      var aa =
      {
        "type": "bubble",
        "size": "nano",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": val.title,
              "size": "md",
              "weight": "bold",
              "align": "center"
            }
          ],
          "backgroundColor": getRandomColor(),
          "action": {
            "type": "message",
            "label": "action",
            "text": "radio " + val.id
          }
        }
      }
      if (i == 11) {
        break;
      } else {
        i++;
      }
      a.push(aa);
    }
    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  });
}
/*都是英文*/
/*function genre(token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/genre-stations?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    client.replyMessage(token, test)
    console.log(response.data.data);
  });
}*/
/*情境電台*/
function mood(token) {
  let translation = {
    "Work Out": "愛運動",
    "Party Animal": "派對動物",
    "Relaxing": "心靈SPA",
    "Working Time": "工作狂",
    "Romantic": "浪漫派",
    "Vacation": "度假",
    "Chill Out": "咖啡館",
    "Tipsy Night": "微醺夜",
    "Acoustic Pop": "小清新",
    "Hardcore": "重口味",
  }
  axios.get(encodeURI('https://api.kkbox.com/v1.1/mood-stations?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    for (const val of response.data.data) {
      var aa = {
        "type": "bubble",
        "size": "micro",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.images[0].url,
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "4:3"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "xl",
                  "color": "#ffffff",
                  "weight": "bold",
                  "text": translation[val.name],
                  "align": "center",
                  "offsetTop": "30%"
                }
              ],
              "position": "absolute",
              "backgroundColor": "#00000050",
              "height": "100%",
              "width": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "message",
            "label": "action",
            "text": "mood " + val.id
          }
        }
      }
      a.push(aa);
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  })
}
function moodsearch(id, token) {
  axios.get(encodeURI('https://api.kkbox.com/v1.1/mood-stations/' + id + '?territory=TW'), { headers: { 'authorization': 'Bearer ' + kkbox_token } }).then(response => {
    let a = [];
    let i = 1;
    for (const val of response.data.tracks.data) {
      var aa = {
        "type": "bubble",
        "size": "kilo",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "image",
              "url": val.album.images[0].url.replace(/160x160/g, "600x600"),
              "size": "full",
              "aspectMode": "cover",
              "aspectRatio": "7:2",
              "gravity": "top"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": val.name.split('(')[0],
                      "size": "xl",
                      "color": "#ffffff",
                      "weight": "bold",
                      "flex": 8
                    },
                    {
                      "type": "text",
                      "text": millisToMinutesAndSeconds(val.duration),
                      "color": "#FFFFFFCC",
                      "align": "end",
                      "weight": "regular",
                      "offsetEnd": "5px",
                      "flex": 2
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "By " + val.album.artist.name.split('(')[0] + "In " + val.album.name.split('(')[0],
                      "color": "#ebebeb",
                      "size": "sm",
                      "flex": 0
                    }
                  ],
                  "spacing": "sm",
                  "paddingTop": "5px"
                }
              ],
              "position": "absolute",
              "offsetBottom": "0px",
              "offsetStart": "0px",
              "offsetEnd": "0px",
              "backgroundColor": "#00000080",
              "paddingAll": "18px",
              "paddingTop": "10px",
              "height": "100%"
            }
          ],
          "paddingAll": "0px",
          "action": {
            "type": "uri",
            "label": "action",
            "uri": "https://widget.kkbox.com/v1/?id=" + val.id + "&type=song&terr=TW&lang=TC&autoplay=false&loop=false"
          }
        }
      }
      a.push(aa);
      if (i == 11) {
        break;
      } else {
        i++;
      }
    }

    client.replyMessage(token, {
      "type": "flex",
      "altText": "session",
      "contents": {
        "type": "carousel",
        "contents": a
      }
    })
  })
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function getRandomColor() {
  var letters = 'BCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`${port}`);
});