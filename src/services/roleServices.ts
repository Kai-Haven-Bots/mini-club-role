import { AnyThreadChannel, ForumChannel, Guild, GuildBasedChannel, GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { channelId, client, mini_clubbers, roleId } from "..";

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

export const owner_process = async () => {
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
        
         console.log(`(Owner) Done in ${((Date.now()-start)/1000).toFixed(1)} seconds`);
         
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/process()");
        console.log(err);
    }
}

export const owner_scan = async () => {
    try{
        setInterval(async () => {
            await owner_process()
        }, 20_000);
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/process()");
        console.log(err);
    }
}


export const give_mini_clubbers = async (member: GuildMember) => {
    try{
        await member.roles.add(mini_clubbers);
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/give_mini_clubbers()");
        console.log(err);
    }
}

export const scan_previous_miniclubbers = async () => {
    try{
        //the purpose of the function is to:
        //1. retrieve all the miniclubs
        //2. retrieve all the messages in each and every miniclubs and giving them role
        //basically for people from the past who have been in miniclub before this

        //step 1: retrieve the channels and miniclubs
        const channel = (await client.channels.fetch(channelId)) as ForumChannel;
        const all = await channel.threads.fetch({}); //note for some reason it fetches ALL the threads in the server instead of just the channels
        let clubs = all.threads.filter(v => v.parentId === channelId);
        
        console.log(`Fetched ${clubs.size} clubs, starting scan...`);
        
        //iterate through all the clubs
        for(let club_raw of clubs){
            let club = club_raw[1];
            let all = await fetch_all_msg(club);

            if(!all) return;

            console.log(`Scanned "${club.name}" total messages: ${all?.length}`);
            
            //go through all the messages and give em miniclubbers.

            for(let msg of all){
                try{
                    // let member = await msg.guild?.members.fetch(msg.author.id);
                    let member = msg.member;
                    if(!member) return;
    
                    give_mini_clubbers(member)
                }catch(err: any){
                }
            }

            console.log(`Gave role to all. (${club.name})`);
        }
    
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/scan_previous_miniclubbers()");
        console.log(err);
    }
}

export const fetch_all_msg = async (thread: GuildTextBasedChannel) => {
    try{
        let all: Message[] = [];

        let buffer_arr: Message[] = [];

        do{
            //getting the last message so the retrieval of message keeps going
            let last_msg = buffer_arr.length===100? buffer_arr[99] : thread.lastMessage;
            
            //reset the previous buffer so we have an accurate measurement on the while
            buffer_arr = [];

            let fetched = await thread.messages.fetch({
                limit: 100,
                before: last_msg?.id
            })

            buffer_arr = Array.from(fetched).map(v => v[1]);
            all.push(...buffer_arr);
        }while(buffer_arr.length===100);

        return all;
    }catch(err: any){
        console.log("Err at /services/roleServices.ts/scan_previous_miniclubbers()");
        console.log(err);
    }
}