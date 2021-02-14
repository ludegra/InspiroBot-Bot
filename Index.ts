import { Channel, Client, Collection, Guild, Message, MessageEmbed, TextChannel } from "discord.js";
import { serverConfig, AddNewGuilds } from "./database";

const fs = require('fs');
const fetch = require('node-fetch');
const {token, inspiroBotAPI, botID} = require('./config.json');
const Discord = require('discord.js');

const client = new Discord.Client();

//Creates an array of .ts files in the commands folder and stores them in a collection
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts')); 

for (const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command); 
}

//Creates a schedule of when to send daily quotes
const cron = require('node-cron');

let schedule = cron.schedule('0 * * * *', () => {
    const currentDate = new Date();
    const hour = currentDate.getHours();

    console.log('Daily check');

    client.guilds.cache.forEach(async guild => {
        const config = await serverConfig.findOne({where: { id: guild.id} });
        if(config.get('sendScheduledMessages') && config.get('dailyTime') === hour){
            Generate(config.get('mainTextChannelId') as string, guild);
        }
    });
}, {
    scheduled: false,
    timezone: "Europe/Berlin"
});

client.once('ready', async () => {
    serverConfig.sync();
    await AddNewGuilds(client);
    schedule.start();
    console.log('Ready');
});

client.on('message', async message => {
    let prefix = '';

    if(message.guild){
        const config = await serverConfig.findOne({where: { id: message.guild.id } });
        prefix = config.get('prefix') as string;
    }

    //Checks for prefix if the message author is not a bot
    if (!(message.content.startsWith(prefix) || message.mentions.has(botID)) || message.author.bot) return; 

    //Seperates the arguments from the command
    const args = message.content.slice(prefix.length).trim().toLowerCase().split(/ +/);
    const commandName = args.shift(); 

    //Checks if a command exeists within the collection
    if(!client.commands.has(commandName)) return message.channel.send(`Invalid command: For a list of commands don't type ${prefix}help`);

    const command = client.commands.get(commandName);
    
    //Executes the command or logs eventual errors
    try {
        command.execute(message, args);
    }
    catch(error) {
        console.log(error);
        message.channel.send('Oops, something went wrong')
    }
})

function Generate(channelId: string, guild: Guild){
    fetch(inspiroBotAPI).then(res => res.text()).then(body => {
        const embed: MessageEmbed = new Discord.MessageEmbed()
            .setColor('#7DBBFA')
            .setTitle('Quote of the day')
            .setImage(body);
        const channel = guild.channels.cache.get(channelId) as TextChannel;
        channel.send(embed);
    });
}

client.login(token);