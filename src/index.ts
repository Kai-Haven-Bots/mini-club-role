import { Client, EmbedBuilder, IntentsBitField} from 'discord.js';
import * as path from 'path';
import { getAllTOwnerRoleMembers, getAllThreadCreators, scan } from './services/roleServices';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})


export const roleId="1108699211664478270";
export const channelId="1104451671972663326";

const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})

client.login(process.env._TOKEN);

client.once('ready', async (client) => {
    console.log("ready");
    await scan();
})




export const errHandler = async (err: any, msg: any) => {
    try{
        const errBed = new EmbedBuilder()
            .setTitle("An error occurred!")
            .setDescription('```' + err.message + "```");
        await msg.reply({
            embeds: [errBed],
            ephemeral: true
        })
    }catch(err){
        console.log("Err on /src/errHandler()");
        console.log(err);
    }
}





