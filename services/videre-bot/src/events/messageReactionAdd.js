import chalk from 'chalk';

/**
 * Handles the bot's ready state.
 */
const MessageReactionAdd = {
  name: 'messageReactionAdd',
  async execute(client, reaction_orig, user) {
    try {
        /**
         * Allow deleting error messages sent by the bot when reacting with the '❌' emoji.
         */
        if (
          // Message author is the bot AND reaction was not from the bot.
          (reaction_orig.message.author.id == client.user.id.toString()
            && user.id !== client.user.id)
          // Emoji reaction is the '❌' emoji with >= 2 reactions or by interacted user.
          && (reaction_orig._emoji.name == '❌'
            || reaction_orig.message.interaction.user.id == user.id.toString()
            || reaction_orig._emoji.reaction.count >= 2)
        ) {
          await client.channels
            .cache.get(reaction_orig.message.channel.id)
            .messages.fetch(reaction_orig.message.id)
            .then(msg => msg.delete());
        }
    } catch (error) {
      console.error(
        chalk.white(`${chalk.yellow(`[events/messageReactionAdd]`)}\n>> ${chalk.red(error.stack)}`)
      );
    }
  },
};

export default MessageReactionAdd;
