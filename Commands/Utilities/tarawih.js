const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder().setName('tarawih').setDescription('Initialise Tarawih'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const replyGif = new AttachmentBuilder(path.join(__dirname, '../../assets/TarawihTime.gif'));
		const dmGif = new AttachmentBuilder(path.join(__dirname, '../../assets/miyabi.gif'));

		await interaction.reply(
			{
				files: [replyGif],
				content: 'Time to Tarawih! React to the message to initiate participation',
				withResponse: true,

			}
		);
		// Format Date
		const tdy = new Date().toLocaleDateString('en-GB');

		const reply = await interaction.fetchReply(); // Fetch and store reply
		await reply.react('1295157966407991406');
		// Filter out bot reactions and only collect the desired emoji reaction
		const filter = (reaction, user) => {
			return reaction.emoji.id === '1295157966407991406' && !user.bot;
		} 
		const collector = reply.createReactionCollector({ filter, time: 10800000 }); // Collect reactions for 3 hours (10800000 milliseconds)

		collector.on('collect', async (reaction, user) => {
			console.log(`Reaction collected from: ${user.username} (${user.id})`);
			console.log(`Emoji: ${reaction.emoji.name} | ID: ${reaction.emoji.id}`);
			try {
				await user.send({
					content : `Assalamu Alaikum **${user.username}!** You've been registered for Tarawih on **${tdy}** 🕌`,
					files : [dmGif]
				}); // Send DM to user who reacted
			} catch (e) {
				await interaction.followUp({ content: `<@${user.id}> enable DMs to participate in Tarawih` }); // If user has DMs disabled, send a follow-up message in the channel
			}
		});

		// // Get total number of reactions after 3 hours ended
		// collector.on('end', collected => {
		// 	console.log(`Collected ${collected.size} reaction items`);
		// })

	},
};