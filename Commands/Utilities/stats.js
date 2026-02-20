import { SlashCommandBuilder, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js';

export default {
	data: new SlashCommandBuilder().setName('tarawih-stats').setDescription('Get Tarawih stats for the period'),
	async execute(interaction) {
		await interaction.reply({ content: "Tarawih Stats" });
	},
};