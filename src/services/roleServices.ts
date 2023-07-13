import { ForumChannel, GuildBasedChannel } from "discord.js";
import { channelId, client, roleId } from "..";

export const getAllThreadCreators = async () => {
    try{
        const channel = (await client.channels.fetch(channelId)) as ForumChannel;
        
        const all = await channel.threads.fetch({}); //note for some reason it fetches ALL the threads in the server instead of just the channels

        let threads = all.threads.filter(v => v.parentId === channelId);

        const guild = channel.guild;

        let returnArr = [];

        for(let thread of threads){

            try{
                const userId = thread[1].ownerId;
                
                if(!userId) continue;
    
                const member = await guild.members.fetch(userId);
    
                const hasRole = member.roles.cache.has(roleId);
    
                returnArr.push({
                    member: member,
                    hasRole
                })
            }catch(err){
                continue;
            }
        }
        
        return returnArr;
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/getAllThreadCreators()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const getAllTOwnerRoleMembers = async () => {
    try{
        const guild = (await client.channels.fetch(channelId) as GuildBasedChannel).guild;
        const members = await guild.members.fetch();

        let hasRoles = Array.from(members.filter(v => v.roles.cache.has(roleId)))

        return hasRoles;

    }catch(err: any){
        console.log("Err at /services/roleServices.ts/getAllThreadCreators()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const process = async () => {
    try{

        const start = Date.now();

        const creators = await getAllThreadCreators();
        const ownerRoleMembers = await getAllTOwnerRoleMembers();

        let hasNoOwnerRole = creators.filter(v => !v.hasRole);
        
        for(let memebr of hasNoOwnerRole){
            await memebr.member.roles.add(roleId);
        }

        const notEligibleForRole = ownerRoleMembers.filter((member) => {
            return !creators.find(v => v.member.user.id === member[1].user.id);
         })

         for(let member of notEligibleForRole){
            await member[1].roles.remove(roleId);
         }
        
         console.log(`Done in ${((Date.now()-start)/1000).toFixed(1)} seconds`);
         
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/process()");
        console.log(err);
    }
}

export const scan = async () => {
    try{
        setInterval(async () => {
            await process()
        }, 20_000);
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/process()");
        console.log(err);
    }
}