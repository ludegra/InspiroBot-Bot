import { Message } from "discord.js";

const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'does not provide a list of commands',
    execute(message: Message, args: string[]){
        message.channel.send('Fuck you!');
    }
}