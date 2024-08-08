const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'falar',
    description: 'Faz o bot enviar uma mensagem específica e apaga a mensagem do usuário',
    async execute(message, args) {
        // Verifica se o usuário forneceu uma mensagem
        if (args.length === 0) {
            return message.reply('Oh mongol, escreve uma coisa válida')
        }

        // Junta todos os argumentos em uma única string
        const mensagem = args.join(' ')

        try {
            // Envia a mensagem no canal
            await message.channel.send(mensagem)

            // Apaga a mensagem do usuário
            await message.delete()
        } catch (error) {
            console.error('Deu algum problema, o erro é:', error)
            message.reply('Deu algum problema kkkkkkkkkkk')
        }
    }
}