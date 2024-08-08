const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js')
const Nota = require('../models/nota')

module.exports = {
  name: 'notas',
  description: 'Anotações que você mesmo pode criar e editar.',
  async execute(message, args) {
    const userId = message.author.id
    let currentPage = 0
    const notasPerPage = 1

    const loadNotas = async () => {
      return await Nota.findAll({ where: { userId }, order: [['id', 'ASC']] })
    }

    const updateEmbed = (notas) => {
      const start = currentPage * notasPerPage
      const end = start + notasPerPage

      const paginatedNotas = notas.slice(start, end)
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Sua Nota')
        .setDescription(paginatedNotas.length > 0 ? paginatedNotas[0].content : 'Nenhuma nota adicionada ainda.')
        .setFooter({ text: `Página ${currentPage + 1} de ${Math.ceil(notas.length / notasPerPage)}` })

      return embed
    }

    const prevButton = new ButtonBuilder()
      .setCustomId('prevPage')
      .setLabel('⬅️')
      .setStyle(ButtonStyle.Primary)

    const nextButton = new ButtonBuilder()
      .setCustomId('nextPage')
      .setLabel('➡️')
      .setStyle(ButtonStyle.Primary)

    const manageButton = new ButtonBuilder()
      .setCustomId('manageNota')
      .setLabel('✏️')
      .setStyle(ButtonStyle.Success)

    const updateButtons = (notas) => {
      prevButton.setDisabled(currentPage === 0)
      nextButton.setDisabled((currentPage + 1) * notasPerPage >= notas.length)

      return new ActionRowBuilder().addComponents(prevButton, nextButton, manageButton)
    }

    let notas = await loadNotas()
    let messageEmbed = await message.reply({
      embeds: [updateEmbed(notas)],
      components: [updateButtons(notas)]
    })

    const collector = messageEmbed.createMessageComponentCollector({ time: 60000 })

    collector.on('collect', async i => {
      if (i.user.id !== userId) {
        return i.reply({ content: 'Você não pode interagir com este comando.', ephemeral: true })
      }

      try {
        if (i.customId === 'prevPage' || i.customId === 'nextPage') {
          await i.deferUpdate()
          
          if (i.customId === 'prevPage') {
            currentPage = Math.max(0, currentPage - 1)
          } else if (i.customId === 'nextPage') {
            currentPage = Math.min(Math.ceil(notas.length / notasPerPage) - 1, currentPage + 1)
          }
          notas = await loadNotas()
          await i.editReply({ embeds: [updateEmbed(notas)], components: [updateButtons(notas)] })
        } else if (i.customId === 'manageNota') {
          const manageOptions = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('addNota')
                .setLabel('Adicionar')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('chooseEditNota')
                .setLabel('Editar')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('chooseDeleteNota')
                .setLabel('Excluir')
                .setStyle(ButtonStyle.Danger)
            )

          await i.update({ content: 'Escolha uma ação:', components: [manageOptions], embeds: [] })
        } else if (i.customId === 'addNota') {
          const modal = new ModalBuilder()
            .setCustomId('addNotaModal')
            .setTitle('Adicionar Nota')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('notaContent')
                  .setLabel('Conteúdo da Nota')
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
              )
            )
          await i.showModal(modal)
        } else if (i.customId === 'chooseEditNota' || i.customId === 'chooseDeleteNota') {
          const notaOptions = notas.map(nota => {
            let resumo = nota.content.substring(0, 50) // Limitar o texto da nota a 50 caracteres
            if (nota.content.length > 50) resumo += '...' // Adiciona reticências se o texto for longo

            return {
              label: resumo,
              value: nota.id.toString()
            }
          })

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(i.customId === 'chooseEditNota' ? 'selectEditNota' : 'selectDeleteNota')
            .setPlaceholder('Selecione uma nota')
            .addOptions(notaOptions)

          const selectMenuRow = new ActionRowBuilder().addComponents(selectMenu)

          await i.update({ content: 'Escolha a nota que você quer editar ou excluir:', components: [selectMenuRow] })
        } else if (i.customId === 'selectEditNota') {
          const notaId = i.values[0]
          const notaSelecionada = await Nota.findByPk(notaId)
          
          const modal = new ModalBuilder()
            .setCustomId(`editNotaModal_${notaId}`)
            .setTitle('Editar Nota')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('notaContent')
                  .setLabel('Conteúdo da Nota')
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue(notaSelecionada.content)
                  .setRequired(true)
              )
            )
          await i.showModal(modal)
        } else if (i.customId === 'selectDeleteNota') {
          const notaId = i.values[0]
          await Nota.destroy({ where: { id: notaId } })
          notas = await loadNotas()
          currentPage = 0 // Voltar à primeira página após exclusão
          await i.update({ content: 'Nota excluída com sucesso!', embeds: [updateEmbed(notas)], components: [updateButtons(notas)] })
        }
      } catch (error) {
        console.error('Erro ao processar interação:', error)
      }
    })

    message.client.on('interactionCreate', async interaction => {
      if (!interaction.isModalSubmit()) return

      if (interaction.customId === 'addNotaModal') {
        const content = interaction.fields.getTextInputValue('notaContent')
        await Nota.create({ userId, content })
        notas = await loadNotas()
        await interaction.reply({ content: 'Nota adicionada com sucesso!', ephemeral: true })
        await messageEmbed.edit({ embeds: [updateEmbed(notas)], components: [updateButtons(notas)] })
      } else if (interaction.customId.startsWith('editNotaModal_')) {
        const notaId = interaction.customId.split('_')[1] // Extrai o ID da nota do customId
        const content = interaction.fields.getTextInputValue('notaContent')
        await Nota.update({ content }, { where: { id: notaId } })
        notas = await loadNotas()
        await interaction.reply({ content: 'Nota editada com sucesso!', ephemeral: true })
        await messageEmbed.edit({ embeds: [updateEmbed(notas)], components: [updateButtons(notas)] })
      }
    })

    collector.on('end', () => {
      messageEmbed.edit({ components: [] })
    })
  }
}
