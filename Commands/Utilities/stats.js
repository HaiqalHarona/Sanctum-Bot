const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('tarawih-stats').setDescription('Get Tarawih stats for the period'),
	async execute(interaction) {
		await interaction.reply({ content: "Tarawih Stats" });
	},
};