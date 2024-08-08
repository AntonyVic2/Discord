const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const editSnipeInfo = {}

module.exports = {
    name: 'editsnipe',
    description: 'Mostra as ultimas mensagens editadas no canal.',
    async execute(message) {
        if (!editSnipeInfo[message.channel.id] || editSnipeInfo[message.channel.id].length === 0) {
            return message.reply('Não encontrei nenhuma mensagem editada no chat <:s_:1258275822771503135>. ')
        }

        let currentIndex = 0

        const createEmbed = (index) => {
            const editedMessage = editSnipeInfo[message.channel.id][index]
            return new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Mensagem Editada ${index + 1}/${editSnipeInfo[message.channel.id].length}`)
                .setAuthor({ name: editedMessage.author.tag, iconURL: editedMessage.author.displayAvatarURL() })
                .addFields(
                    { name: 'Antes', value: editedMessage.oldContent },
                    { name: 'Depois', value: editedMessage.newContent }
                )
                .setTimestamp(editedMessage.editedAt)
                .setFooter({ text: 'Mensagem editada em' })
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
                        .setDisabled(currentIndex === editSnipeInfo[message.channel.id].length - 1)
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
    handleEdit(oldMessage, newMessage) {
        if (!editSnipeInfo[oldMessage.channel.id]) {
            editSnipeInfo[oldMessage.channel.id] = []
        }
        editSnipeInfo[oldMessage.channel.id].unshift({
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            author: oldMessage.author,
            editedAt: new Date()
        })
        // Limitar o número de mensagens salvas para 10
        if (editSnipeInfo[oldMessage.channel.id].length > 20) {
            editSnipeInfo[oldMessage.channel.id].pop()
        }
    }
}