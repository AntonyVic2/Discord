const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { Player } = require('discord-player')

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ] 
})


client.commands = new Collection()

const commandsPath = path.join(__dirname, 'comandos')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    client.commands.set(command.name, command)
}

// Adicione logs de depuração aqui para verificar comandos inválidos
client.commands.forEach((command, name) => {
    if (!command.name) {
        console.warn(`Comando sem nome detectado no arquivo: ${name}`)
    }
    if (!command.name || typeof command.name !== 'string') {
        console.warn(`Comando inválido detectado:`, command)
    }
})

client.once('ready', () => {
    console.log('O bot está online!')
})

client.on('messageDelete', message => {
    const snipeCommand = client.commands.get('snipe')
    if (snipeCommand) {
        snipeCommand.handleDelete(message)
    }
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) return
    const editSnipeCommand = client.commands.get('editsnipe')
    if (editSnipeCommand) {
        editSnipeCommand.handleEdit(oldMessage, newMessage)
    }
})

client.on('messageCreate', async message => {
    if (message.author.bot) return

    // Responde apenas se o bot for mencionado diretamente no início da mensagem
    if (message.content.startsWith(`<@${client.user.id}>`)) {
        return message.reply('Oieee! Me chamo bot. Qualquer coisa, utilize `!comandos`.')
    }

    // Verificação de link de mensagem do Discord
    const discordLinkRegex = /https:\/\/(?:ptb\.|canary\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/
    const match = message.content.match(discordLinkRegex)
    console.log('Match encontrado:', match) // Log para verificar se o link foi encontrado

    if (match) {
        const [, guildId, channelId, messageId] = match
        console.log('IDs extraídos:', guildId, channelId, messageId) // Log para verificar IDs extraídos

        try {
            const channel = await client.channels.fetch(channelId)
            if (!channel.isTextBased()) {
                return message.reply('Isso nem é um canal de texto kkkk')
            }

            const fetchedMessage = await channel.messages.fetch(messageId)
            console.log('Mensagem encontrada:', fetchedMessage.content) // Log para verificar o conteúdo da mensagem

            // Criar o embed com link para a mensagem original
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({ name: fetchedMessage.author.tag, iconURL: fetchedMessage.author.displayAvatarURL() })
                .setDescription(fetchedMessage.content || 'Mensagem sem conteúdo') // Certifique-se de que o conteúdo está disponível
                .setTimestamp(fetchedMessage.createdTimestamp)

            // Criar o botão "Ir para a mensagem"
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Ir para a mensagem')
                        .setStyle(ButtonStyle.Link)
                        .setURL(fetchedMessage.url)
                )

            await message.channel.send({ embeds: [embed], components: [row] })
        } catch (error) {
            console.error('Erro ao buscar a mensagem:', error) // Log para erros ao buscar a mensagem
            message.reply('Não consegui buscar a mensagem, verifique se o link está correto.')
        }
    }

    if (!message.content.startsWith('!')) return

    const args = message.content.slice(1).split(/ +/)
    const commandName = args.shift().toLowerCase()

    const command = client.commands.get(commandName)
    if (!command) return

    try {
        await command.execute(message, args, client)
    } catch (error) {
        console.error('Erro ao executar o comando:', error)
        message.reply('Deu erro :(')
    }
})

client.login('token do bot') 
