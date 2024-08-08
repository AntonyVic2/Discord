const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')

module.exports = {
    name: 'comandos',
    description: 'Mostra todos os comandos disponíveis',
    async execute(message, args, client) {
        const commands = client.commands
        const perPage = 5
        const pages = Math.ceil(commands.size / perPage)

        let currentPage = 0

        const generateEmbed = (page) => {
            const start = page * perPage
            const end = start + perPage
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Comandos Disponíveis')
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()

            const commandList = Array.from(commands.values()).slice(start, end)
            commandList.forEach(command => {
                if (command.name && command.name.trim() !== '') { // Verificar se o nome do comando é válido
                    embed.addFields({ name: `!${command.name}`, value: command.description || 'Sem descrição disponível' })
                }
            })

            embed.setDescription(`Página ${page + 1} de ${pages}`)

            return embed
        }

        const prevButton = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)

        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)

        const updateButtons = () => {
            prevButton.setDisabled(currentPage === 0)
            nextButton.setDisabled(currentPage === pages - 1)

            return new ActionRowBuilder().addComponents(prevButton, nextButton)
        }

        const messageEmbed = await message.reply({ embeds: [generateEmbed(currentPage)], components: [updateButtons()] })

        const collector = messageEmbed.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 })

        collector.on('collect', interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: 'Apenas a pessoa que usou o comando pode interagir com os botões.', ephemeral: true })
            }

            if (interaction.customId === 'prev') {
                currentPage--
            } else if (interaction.customId === 'next') {
                currentPage++
            }

            messageEmbed.edit({ embeds: [generateEmbed(currentPage)], components: [updateButtons()] })

            interaction.deferUpdate()
        })

        collector.on('end', () => {
            // Desativar os botões em vez de removê-los
            prevButton.setDisabled(true)
            nextButton.setDisabled(true)
            messageEmbed.edit({ components: [new ActionRowBuilder().addComponents(prevButton, nextButton)] })
        })
    }
}

