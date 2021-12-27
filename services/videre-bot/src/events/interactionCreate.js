import chalk from 'chalk';
import { ERROR_DEFAULTS } from 'constants';

// import { MessageActionRow, MessageButton } from 'discord.js';

import { sanitize, validateMessage, registerComponents } from 'utils/discord';
import { extractUrls, matchDeckUrl } from 'utils/deck-urls';

/**
 * Handles interaction events.
 */
const InteractionEvent = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    try {
      const time_1 = new Date().getTime();
      function time_2(time = time_1) {
        return (2 * client.ws.ping)
          + new Date().getTime() - time;
      }
      switch (interaction.type) {
        // Command interactions
        case 'APPLICATION_COMMAND': {
          const { commandName, options } = interaction;

          const command = client.commands.get(commandName);
          if (!command) return;

          // Create object with arg props
          let args = (options?.data)
            ? options.data.reduce((object, { name, value }) => {
                object[name] = sanitize(value);
                return object;
              }, {})
            : {};

          const output = await command.execute({
            client,
            interaction,
            args,
          });
          if (!output) return;

          const data = validateMessage(output);

          if (output?.deferred) {
            // Timeout after 15 minutes.
            if (time_2() >= 9 * 10**5) return;
            await interaction.editReply(data);
          } else {
            // Timeout after 3 seconds.
            if (time_2() >= 3 * 10**3) return;
            await interaction.reply(data);
          }
          if (!data.components) return;

          const message = await interaction.fetchReply();

          return registerComponents(client, message.id, data.components);
        }
        // Button interactions
        case 'MESSAGE_COMPONENT': {
          try {
            if (interaction.customId == 'x_button') {
              await interaction.message.delete();
              return;
            } else if (interaction.customId == 'null') {
              return;
            }

            // Timeout after 15 minutes.
            const timestamp = interaction.message.createdTimestamp;
            if (time_2(new Date(timestamp)) >= 9 * 10**5) {
              const { commandName } = interaction?.message?.interaction;
              // const button = new MessageButton()
              //   .setStyle('PRIMARY')
              //   .setLabel('Start a new interaction')
              //   .setCustomId(interaction.customId.toString());
              await interaction.reply(validateMessage({
                embeds: [{
                  ...ERROR_DEFAULTS,
                  title: 'This interaction has expired.',
                  description: `Use \`/${commandName}\` to create a new interaction.`,
                  footer: { text: 'You can also use /help for more command info.' }
                }],
                // components: [new MessageActionRow().addComponents(button)],
                ephemeral: true
              }));
              return;
            }

            let command, _args/**, mode*/;/**
            if (interaction.message.embeds?.[0]?.title == 'This interaction has expired.') {
              mode = 'interaction-renew';

              const { messageId } = interaction.message.reference;
              const message = await interaction
                .message
                .channel.messages.fetch(messageId);

              const { commandName } = message.interaction;
              command = client.commands.get(commandName);

              switch (commandName) {
                case 'card':
                  const [
                    set,
                    collectors_number,
                    name
                  ] = message
                      ?.components[0]
                      ?.components[1]
                      .url
                      .split('/card/')[1]
                      .split('/');
                  _args = JSON.stringify({ name, set, collectors_number });
                  break;
              }
            } else*/ if (!interaction.message.interaction) {
              command = client.commands.get('decklist');
              const { messageId } = interaction.message.reference;
              const decklist_url = await interaction
                .message
                .channel.messages.fetch(messageId)
                .then(msg => 
                  extractUrls(msg.content)
                    .map(url => matchDeckUrl(url))
                    .filter(Boolean)[0]
                );
              if (interaction.customId == 'decklist-prompt') {
                _args = JSON.stringify({
                  decklist_url,
                  mode: false
                });
              }
            } else {
              const { commandName } = interaction?.message?.interaction;
              command = client.commands.get(commandName);
            }

            // Create object with arg props
            const args = JSON.parse(_args || interaction.customId);

            const output = await command.execute({
              client,
              interaction,
              args,
            });
            if (!output) return;

            const data = validateMessage(output);

            // if (mode == 'interaction-renew') {
            //   return await interaction.reply(data);
            // }

            // Address persisting attachment behavior.
            await interaction.message.removeAttachments();
  
            if (output?.deferred) {
              // Timeout after 15 minutes.
              if (time_2() >= 9 * 10**5) return;
              return await interaction.editReply(data);
            } else {
              // Timeout after 3 seconds.
              if (time_2() >= 3 * 10**3) return;
              return await interaction.update(data);
            }
          } catch {
            const listenerId = `${interaction.message.id}-${interaction.customId}`;
            const callback = client.listeners.get(listenerId);
            if (!callback) return;

            const output = await callback(interaction);
            if (!output) return;

            const data = validateMessage(output);

            // Timeout after 3 seconds.
            if (time_2() >= 3 * 10**3) return;
            // Address persisting attachment behavior.
            await interaction.message.removeAttachments();
            return await interaction.update(data);
          }
        }
        default:
          return;
      }
    } catch (error) {
      console.error(chalk.white(`${chalk.yellow(`[interactionCreate]`)}\n>> ${chalk.red(error.stack)}`));
    }
  },
};

export default InteractionEvent;
