const { SlashCommandBuilder, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
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
			// console.log(`Reaction collected from: ${user.username} (${user.id})`);
			// console.log(`Emoji: ${reaction.emoji.name} | ID: ${reaction.emoji.id}`);
			try {
				// Create Tarawih Participation Menu
				const options = [{
					label: 'Present',
					description: 'I will be attending Tarawih',
					value: 'present'
				}, {
					label: 'Absent',
					description: 'I will not be attending Tarawih',
					value: 'absent'
				}];

				const tarawihMenu = new StringSelectMenuBuilder()
					.setCustomId(interaction.id)
					.setPlaceholder('Select your Tarawih attendance status')
					.setMinValues(1)
					.setMaxValues(1)
					.addOptions(options.map(option => new StringSelectMenuOptionBuilder()
						.setLabel(option.label)
						.setDescription(option.description)
						.setValue(option.value)
					));

				const actionRow = new ActionRowBuilder().addComponents(tarawihMenu);

				const dm = await user.send({
					content: `Assalamu Alaikum **${user.username}!** You've been registered for Tarawih on **${tdy}** 🕌`,
					files: [dmGif],
					components: [actionRow]
				}); // Send DM to user who reacted

				// Collect selected option from the user
				const dmCollector = dm.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 1800000 }); // Collect for 30 minutes
				dmCollector.on('collect', async (i) => {
					const selected = i.values[0]; // Get selected value
					if (selected === 'present') {
						await i.update({ content: `✅ You have been marked as **Present** for Tarawih tonight on **${tdy}** 🕌`, components: [] });
					} else if (selected === 'absent') {
						await i.update({ content: `❌ You have been marked as **Absent** for Tarawih tonight on **${tdy}**`, components: [] });
					}
				});
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