(async()=>{
    "use strict";

    // Dependencies
    const { Client, Intents } = require("discord.js")
    const { MongoClient } = require("mongodb")
    const { nanoid } = require("nanoid")
    
    // Variables
    const pao = {
        token: "",
        verifyRoleID: "",
        mongoDB: ""
    }
    
    const bot = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS ] })
    const client = new MongoClient(pao.mongoDB)
    const database = client.db("core")
    const users = database.collection("pao.users")
    
    // Main
    console.log("Connecting to the database, please wait...")
    await client.connect()
    console.log("Successfully connected to the database.")
    
    bot.on("ready", ()=>{
        bot.user.setActivity("HWID Verification Bot.")
        console.log("Pao is running.")
    })
    
    bot.on("message", async(message)=>{
        if(message.author.bot) return
        if(!message.content.startsWith("p.")) return
    
        if(message.content === "p.verify"){
            const exists = await users.findOne({ userID: message.author.id })
            
            if(exists && exists.verified){
                const hasRole = message.member.roles.cache.has(pao.verifyRoleID)

                if(hasRole) return

                message.member.roles.add(message.guild.roles.cache.get(pao.verifyRoleID))
                return  message.reply("Successfully verified.")
            }
            if(exists && !exists.verified) return message.reply("We have already sent you a code.")
    
            const code = nanoid()
            await users.insertOne({ userID: message.author.id, code: code, verified: false })
            message.reply(`Please download Pao Framework and input this code. ||${code}||`)
        }
    })
    
    bot.login(pao.token)
})()