import { Message, MessageEmbed } from "discord.js";
import { serverConfig } from "../database";

const { inspiroBotAPI } = require("../config.json");
const fetch = require('node-fetch');

module.exports = {
    name: 'daily',
    description: 'Toggles daily quotes',
    args: 'type ',
    async execute(message: Message, args: string[]){
        const config = await serverConfig.findOne({ where: { id: message.guild.id } });
        const toggle = config.get('sendScheduledMessages') as Boolean;
        const prefix = config.get('prefix') as string;

        const commandName = args.shift(); 

        //Toggeling the daily quotes. Args: True/False
        if(commandName === 'toggle'){
            if(args[0] != 'true' && args[0] != 'false') return message.channel.send(`Invalid arguments\n\nFor a list of arguments to use with the ${prefix}daily command, type: \`${prefix}daily help\``);

            const argsToBool = (args[0] === 'true');

            if(toggle ? !argsToBool : argsToBool){
                if(!config.get('mainTextChannelId')){
                return message.channel.send(`Channel to send daily quotes to is not specified \n\nTo specify which channel to send quotes to, use command: \`${prefix}daily channel [text channel]\``);
                }
                await serverConfig.update({ sendScheduledMessages: !toggle }, { where: { id: message.guild.id } });
                return message.channel.send(`Daily quotes is set to: \`${argsToBool}\``);
            }
            else{
                return message.channel.send(`Daily quotes is already set to: \`${toggle ? 'true' : 'false'}\``);
            } 
        }
        
        //Setting channel for daily quotes. Args: Channel mention(<#id>)
        else if(commandName === 'channel'){
            if(!/^<#\d{18}>$/.test(args[0])) return message.channel.send(`${args[0]} is not a valid channel id`)

            const channelId = args[0].slice(2, 20);

            if(message.guild.channels.cache.has(channelId)){
                await serverConfig.update({ mainTextChannelId: channelId }, { where: { id: message.guild.id } });
                return message.channel.send(`Channel for daily quotes is set to: <#${channelId}>`);
            }
            else{
                console.log(message.guild.channels.cache);
                console.log(channelId);
                return message.channel.send('The specified channel does not exist within the server');
            }
        }

        //Setting the time for daily quotes. Args: Hours in various formats
        else if(commandName === 'time'){
            if(!/^(((0|1){0,1}\d)|(2[0-3]))((\.|:)00(\.00){0,1}){0,1}$/.test(args[0])){
                if(/^(((0|1)\d)|(2[0-3]))(:|\.)\d\d((:|\.)\d\d){0,1}$/.test(args[0])) return message.channel.send('The time has to be an whole hour');
                
                return message.channel.send(`${args[0]} is not a valid time`);
            }
            const hour = args.slice(0,2);
            await serverConfig.update({ dailyTime: hour }, { where: { id: message.guild.id } });
            return message.channel.send(`Time for daily messages set to: \`${hour}:00.00\``)
        }

        //Check status 
        else if(commandName === 'status'){
            fetch(inspiroBotAPI).then(res => res.text()).then(body => {

                const embed = new MessageEmbed()
                    .setColor('#FC651F')
                    .setTitle('Daily Status')
                    .setThumbnail(body)
                    .setDescription(`Daily massages are ${config.get('sendScheduledMessages') ? 'activated' : 'dissabled'}`)
                    .addFields(
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Time', value: `${config.get('dailyTime')}:00 CET`, inline: true},
                        {name: 'Channel', value: `<#${config.get('mainTextChannelId')}>`, inline: true}
                    )
                    .setFooter(message.author.tag, message.author.avatarURL())
                    .setTimestamp();
            
                return message.channel.send(embed);
            });
        }
        
        //Shows an embed with all main args for !Daily
        else if(commandName === 'help'){
            fetch(inspiroBotAPI).then(res => res.text()).then(body => {
                const embed = new MessageEmbed()
                    .setColor('#FC651F')
                    .setTitle(`List of arguments to use with: ${prefix}daily`)
                    .addFields(
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Toggle [true/false]', value: 'Toggle daily messages on and off', inline: true },
                        { name: 'Channel [#channel]', value: 'Select which channel to recieve daily messages', inline: true },
                        { name: 'Time [Whole hour]', value: 'Set which time to send daily messages', inline: true },
                        { name: 'Status', value: 'See status of daily messages', inline: true }
                    )
                    .setThumbnail(body)
                    .setFooter(message.author.tag, message.author.avatarURL())
                    .setTimestamp()

            return message.channel.send(embed);
            });
        }
    } 
}
