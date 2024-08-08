const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const snipeInfo = {}

module.exports = {
    name: 'snipe',
    description: 'Mostra as últimas mensagens deletadas no canal',
    async execute(message) {
        if (!snipeInfo[message.channel.id] || snipeInfo[message.channel.id].length === 0) {
            return message.reply('Oiee! não existe nenhuma mensagem apagada nesse chat <:s_:1258275822771503135>.')
        }

        let currentIndex = 0

        const createEmbed = (index) => {
            const snipedMessage = snipeInfo[message.channel.id][index]
            return new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Mensagem Apagada ${index + 1}/${snipeInfo[message.channel.id].length}`)
                .setAuthor({ name: snipedMessage.author.tag, iconURL: snipedMessage.author.displayAvatarURL() })
                .setDescription(snipedMessage.content)
                .setTimestamp(snipedMessage.createdAt)
                .setFooter({ text: 'Mensagem apagada em:' })
        }

        const createButtons = () => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('⬅️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentIndex === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentIndex === snipeInfo[message.channel.id].length - 1)
                )
        }

        const reply = await message.channel.send({
            embeds: [createEmbed(currentIndex)],
            components: [createButtons()]
        })

        const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === message.author.id
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 })

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentIndex--
            } else if (i.customId === 'next') {
                currentIndex++
            }

            await i.update({
                embeds: [createEmbed(currentIndex)],
                components: [createButtons()]
            })
        })

        collector.on('end', () => {
            reply.edit({ components: [] })
        })
    },
    handleDelete(message) {
        if (!snipeInfo[message.channel.id]) {
            snipeInfo[message.channel.id] = []
        }
        snipeInfo[message.channel.id].unshift({
            content: message.content,
            author: message.author,
            createdAt: message.createdAt
        })
        // Limitar o número de mensagens salvas para 10
        if (snipeInfo[message.channel.id].length > 15) {
            snipeInfo[message.channel.id].pop()
        }
    }
}