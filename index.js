/**
 * @author Aleksandros Profka <@github.com/aprofka>
 * @description This application would forward discord messages from specified channels, from any server to any other channel in any server.
 * 
 **/

const winston = require("winston");
const config = require("./config.json");
const discord = require("discord.js");
const client = new discord.Client();


var channelConfig = new Map();
const tagType = ["", " @here", " @everyone"]

// Origin/Source Channel -> [Target Channel, tagType]
channelConfig.set("SOURCE_CHANNEL_ID_NUMBER", ["TARGET_CHANNEL_ID_NUMBER","2"]); // flip-news-and-releases

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

  //This will run on every discord message
  client.on("messageCreate", message => {
    //This will return if the message is not from the list/array of channels to listen to
    let channelIDs = Array.from( channelConfig.keys() );
    if ( channelIDs && channelIDs.length > 0 && !channelIDs.includes(message.channel.id)) { return }

    //This will log only the first 20 characters of each message
    logger.info('[' + message.author.tag + "] " + message.content.substring(0, 20) + "...");
    if(!message.system){
      client.channels.cache.get(channelConfig.get(message.channel.id)[0]).send({
        content: '[' + message.author.tag + "] \r\n" 
          + message.content 
          + tagType[Number(channelConfig.get(message.channel.id)[1])], 
        embeds: message.embeds,
        files: Array.from(message.attachments.values()),
      });
    }
  });
}

client.login(config.token);
botStart();