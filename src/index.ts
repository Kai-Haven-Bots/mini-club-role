import { AnyThreadChannel, Client, EmbedBuilder, ForumChannel, GuildBasedChannel, GuildTextBasedChannel, IntentsBitField} from 'discord.js';
import * as path from 'path';
import { getAllTOwnerRoleMembers, getAllThreadCreators, owner_scan, fetch_all_msg, scan_previous_miniclubbers, give_mini_clubbers } from './services/roleServices';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})


export const roleId="1108699211664478270";
export const channelId="1104451671972663326";

//for the mini club chatters
export const mini_clubbers = "1143462057195339836";

const F = IntentsBitField.Flags;

export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})

client.login(process.env._TOKEN);

client.once('ready', async (client) => {
    console.log("ready");
    // await owner_scan();
    // await scan_previous_miniclubbers(); //it runs just once at startup
})

//this part is especially for the mini club role part.
client.on('messageCreate', async (msg) => {
    if(!msg.guild) return;
    let channel = msg.channel as GuildTextBasedChannel;
    //we will also add AI club role

    if(channel.id === "1205177809257889872"){
        try{
            const member = msg.member;
            if(!member) throw new Error("No member found");

            if(!member.roles.cache.has("1205187533873356911")){
                await member.roles.add("1205187533873356911")
            }
        }catch(err: any){
            console.log("Err while giving AI club roles");
            console.log(err);
        }
    }

    if(channel.parent?.id !== "1104451671972663326") return;
    
    if(msg.member)
        give_mini_clubbers(msg.member);
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





