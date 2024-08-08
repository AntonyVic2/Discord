const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'avatar',
    description: 'Mostra a foto de perfil do usuário.',
    async execute(message, args) {
        let user

        if (args[0] && !message.mentions.users.size) {
            try {
                user = await message.client.users.fetch(args[0])
            } catch (error) {
                return message.reply('Não foi possível encontrar o usuário especificado.')
            }
        } else {
            user = message.mentions.users.first() || message.author
        }

        const avatarEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Avatar de ${user.tag}`)
            .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
            .setDescription(`[Link do avatar](${user.displayAvatarURL({ size: 1024, dynamic: true })})`)
            .setTimestamp()

        message.reply({ embeds: [avatarEmbed] })
    }
}
