import chalk from 'chalk';

import { MessageActionRow, MessageButton } from 'discord.js';

import { extractUrls, matchDeckUrl } from 'utils/deck-urls';

import { x_button } from 'constants';

/**
 * Handles Discord message events.
 */
const MessageEvent = {
  name: 'messageCreate',
  async execute(client, msg) {
    try {
      let urls = extractUrls(msg.content)
        ?.map(url => matchDeckUrl(url))
        ?.filter(Boolean);
      // Handle adding reacts for custom event listeners.
      if (msg.author.bot) {
        // Ignore ephemeral messages.
        if (Object.values(msg?.flags)[0] == 64) return;
        // Perform exponential back-off for deferred messages.
        if (msg.content == '' && !msg.embeds.length && msg.interaction) {
          for (let i = 1; i <= 10; i++) {
            const _i = parseInt(((((15 * 60) ** (1 / 10)) ** i) * 1000).toFixed(2)) - 974;
            await new Promise(res => setTimeout(res, _i));
            const channel = await client.channels.fetch(msg.channel.id);
            const _msg = await channel.messages.fetch(msg.id);
            if (_msg?.deleted === true) return;
            if (_msg?.embeds[0]?.title == 'Error') {
              await msg.react('❌'); return;
            } else if (_msg?.embeds[0]) return;
          }
        // React to regular responses immediately.
        } else if (msg?.embeds[0]?.title == 'Error') {
          await msg.react('❌'); return;
        }
      } else if (urls?.length) {
        const button = new MessageButton()
          .setStyle('PRIMARY')
          .setLabel('Show Visual Decklist')
          .setCustomId('decklist-prompt')
          .setEmoji('837140782820622346'); // :manat: tap emoji
        await msg.reply({
          content: 'Would you like to show a deck preview?',
          components: [new MessageActionRow().addComponents(button, x_button())],
          allowedMentions: { repliedUser: false }
        });
      }
    } catch (error) {
      console.error(chalk.white(`${chalk.yellow(`[events/message]`)}\n>> ${chalk.red(error.stack)}`));
    }
  },
};

export default MessageEvent;
