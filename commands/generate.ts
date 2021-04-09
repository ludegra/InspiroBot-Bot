import { Client, ClientUser, Guild, Message, MessageEmbed, TextChannel } from "discord.js";

const {inspiroBotAPI} = require('../config.json');
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
    name: 'generate',
    description: 'generates a quote',
    execute(message: Message, args: string[]) {
        fetch(inspiroBotAPI).then(res => res.text()).then(body => {
    
            const embed: MessageEmbed = new Discord.MessageEmbed()
            .setColor('#7DBBFA')
            .setTitle(`Quote requested`)
            .setImage(body)
            .setDescription(`Request by: <@!${message.author.id}>`)
            .setFooter(message.author.tag, message.author.avatarURL())
            .setTimestamp();
        
            message.channel.send(embed);
        });
    },
    generate: Generate
}

export function Generate(channelId: string, guild: Guild, client: Client, title: string){
    fetch(inspiroBotAPI).then(res => res.text()).then(body => {
        const embed: MessageEmbed = new Discord.MessageEmbed()
            .setColor('#7DBBFA')
            .setTitle(title)
            .setImage(body)
            .setFooter(client.user.tag, client.user.displayAvatarURL())
            .setTimestamp();
        const channel = guild.channels.cache.get(channelId) as TextChannel;
        channel.send(embed);
    });
}
