import { Message, MessageEmbed } from "discord.js";

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
                .setDescription(`Request by: <@!${message.author.id}>`);

            message.channel.send(embed);
        });
    }
}