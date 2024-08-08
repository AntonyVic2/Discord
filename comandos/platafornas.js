const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'plataforma',
    description: 'Mostra a plataforma do usuário, ótimo para humilhar aqueles mobiles de plantão...',
    async execute(message, args) {
        let member
        
        if (message.mentions.members.size) {
            // Se o comando mencionar um usuário
            member = message.mentions.members.first()
        } else {
            // Caso contrário, use o autor da mensagem
            member = message.guild.members.cache.get(message.author.id)
        }

        if (!member) {
            return message.reply('Não encontrei nada')
        }

        const platform = Object.keys(member?.presence?.clientStatus || {"Nenhuma": "nenhum"})
            .join(", ")
            .replace("mobile", "Mobile")
            .replace("desktop", "PC")
            .replace("embedded", "Console")
            .replace("web", "Navegador") || "Nenhuma"

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Plataforma do Usuário')
            .setDescription(`${member.user.username} está usando a plataforma: ${platform}`)
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()

        message.reply({ embeds: [embed] })
    }
}
