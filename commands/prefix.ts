import { Message } from "discord.js";
import { serverConfig } from "../database";

module.exports = {
    name: 'prefix',
    description: 'Allows for changing of prefix',
    async execute(message: Message, args: string[]){
        const newPrefix = await serverConfig.update({ prefix: args[0] }, { where: { id: message.guild.id } });
        if(newPrefix[0] > 0){
            message.channel.send(`Prefix set to: ${args[0]}`);
        }
    }
}