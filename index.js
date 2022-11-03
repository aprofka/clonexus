/**
 * @author Aleksandros Profka <@github.com/aprofka>
 * @description This application would forward discord messages from specified channels, 
 *              from any server to any other channel in any server.
 * 
 **/

const winston = require("winston");
const config = require("./config.json");
const { Client } = require("discord.js");
const client = new Client();

const tagType = ["", " @here", " @everyone"]

var channelConfig = new Map();

// Origin/Source Channel -> [Target Channel, tagType]
channelConfig.set("SOURCE_CHANNEL_ID_NUMBER", ["TARGET_CHANNEL_ID_NUMBER","TAG_TYPE_NUMBER"]); // channel-name

async function botStart(){
  //Sets up the logger
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      // - Write all logs to console.
      new winston.transports.Console(),
      // - Write all logs error (and below) to `error.log`.
      new winston.transports.File({ filename: "error.log", level: "error" }),
      // - Write to all logs with level `info` and below to `combined.log`
      new winston.transports.File({ filename: "combined.log" })
    ]
  });

  client.on("ready", () => {
    logger.info(`Logged in as ${client.user.tag}`);
  });


  try {
    //This will run on every discord message
    client.on("messageCreate", message => {
      //This will return if the message is not from the list/array of channels to listen to
      let channelIDs = Array.from( channelConfig.keys() );
      
        if ( channelIDs && channelIDs.length > 0 && !channelIDs.includes(message.channel.id)) { return }

        if(!message.system){
          //This will log only the first 20 characters of each message
          logger.info('[' + message.author.tag + "] " + message.content.substring(0, 20) + "...");

          /*This checks if the message has any embeds and gets the link if any.
            You can comment this out or delete if you dont need it */
          let sEmbedURL = "";
          if(message.embeds.length > 0 && message.embeds[0].fields.length > 0){
            sEmbedURL = "\r\n [Embed URL] - " + message.embeds[0].url;
          }

          /*This checks if a message contains Out of Stock and doesnt tag anyone
            You could change this to another words or use an array/list to check for
            multiple words */
          let iTag = 0;
          if(!message.content.includes("Out of Stock")){
            iTag = Number(channelConfig.get(message.channel.id)[1]);
          }
          let sForwardContent = message.content + tagType[iTag] + sEmbedURL;

          client.channels.cache.get(channelConfig.get(message.channel.id)[0]).send({
            content: sForwardContent,
            files: Array.from(message.attachments.values()),
            embeds: message.embeds,
          });

        }
    });
  }catch(e) {
    logger.error(e)
  }
}

client.login(config.token);
botStart();