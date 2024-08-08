const { EmbedBuilder } = require('discord.js')
const util = require('util')

module.exports = {
    name: 'eval',
    description: 'Executa código JavaScript (apenas para o dono do bot)',
    async execute(message, args, client) {
        // ID do dono do bot
        const ownerId = 'id do dono'
        // ID do canal para enviar os resultados
        const logChannelId = 'id do chat de logs'

        // Verifica se quem usou o comando é o dono do bot
        if (message.author.id !== ownerId) {
            return message.reply('Apenas o dono pode utilizar este comando.')
        }

        // Junta os argumentos para formar o código a ser executado
        const code = args.join(' ')

        if (!code) {
            return message.reply('falta o código')
        }

        // Obtém o canal de log
        const logChannel = await client.channels.fetch(logChannelId)

        if (!logChannel) {
            return message.reply('Não foi possível encontrar o canal de log.')
        }

        try {
            // Executa o código
            let evaled = eval(code)

            // Se o resultado for uma Promise, resolve-a
            if (evaled instanceof Promise) {
                evaled = await evaled
            }

            // Converte o resultado em uma string formatada
            const cleaned = await clean(evaled)

            // Cria um embed com o resultado
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Eval - Sucesso')
                .addFields(
                    { name: 'Entrada', value: `\`\`\`javascript\n${code}\n\`\`\`` },
                    { name: 'Saída', value: `\`\`\`javascript\n${cleaned}\n\`\`\`` }
                )

            // Envia o embed para o canal de log
            await logChannel.send({ embeds: [embed] })
            
            // Envia uma mensagem de confirmação no canal onde o comando foi usado
            message.reply('Comando executado com sucesso. Resultado enviado para o canal de log.')
        } catch (err) {
            // Se ocorrer um erro, cria um embed com o erro
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Eval - Erro')
                .addFields(
                    { name: 'Entrada', value: `\`\`\`javascript\n${code}\n\`\`\`` },
                    { name: 'Erro', value: `\`\`\`javascript\n${err}\n\`\`\`` }
                )

            // Envia o embed de erro para o canal de log
            await logChannel.send({ embeds: [embed] })
            
            // Envia uma mensagem de erro no canal onde o comando foi usado
           
        }
    }
}

// Função para limpar e formatar a saída
async function clean(text) {
    if (text && text.constructor.name == "Promise")
        text = await text

    if (typeof text !== "string")
        text = util.inspect(text, { depth: 1 })

    text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))

    return text
}