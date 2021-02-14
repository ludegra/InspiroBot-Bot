import { Sequelize } from "sequelize/types";

const Sequalize = require('sequelize');

//Setting up the database
const sequalize: Sequelize = new Sequalize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

//A config table for each server
export const serverConfig = sequalize.define('serverConfig', {
    id:{ 
        type: Sequalize.STRING,
        unique: true,
        primaryKey: true,
    },
    name: Sequalize.STRING,
    prefix: {
        type: Sequalize.STRING,
        defaultValue: "!",
    },
    mainTextChannelId: Sequalize.STRING,
    sendScheduledMessages: {
        type: Sequalize.BOOLEAN,
        defaultValue: false,
    },
    dailyTime: {
        type: Sequalize.INTEGER,
        defaultValue: 10,
    },
});

//Checks for servers without config tables and creates new config tables if needed
export function AddNewGuilds(client){
    client.guilds.cache.forEach(async guild => {
        const configChecker = await serverConfig.findOne({ where: { id: guild.id } });
    
        if(!configChecker){
            try {
                const server = await serverConfig.create({
                    id: guild.id,
                    name: guild.name,
                })
                console.log(`Server: ${guild.name} | ${guild.id} has been added`)
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    return console.log('Tried to add an existing tag');
                }
                return console.error(error);
            }
        }
    });
}