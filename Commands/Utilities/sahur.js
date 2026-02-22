import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import 'dotenv/config'; // Modern way to import and run dotenv
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    data: new SlashCommandBuilder().setName('sahur').setDescription('initialise sahur'),
    async execute(interaction) {
        const sahurGif = new AttachmentBuilder(path.join(`${__dirname}/../../assets/sahur.gif`));
        // Fetch Channel to send announcement in
        const channel = await interaction.guild.channels.fetch(process.env.CHANNEL_ID); // Announcement Channel
        const Announcement = new EmbedBuilder()
            .setColor('C20000')
            .setTitle(`BANGUN SAHUR!`)
            .setAuthor({
                name: 'Islamic Board of Sanctum',
                iconURL: 'https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg'
            })
            .setDescription(
                'Time for sahur grab your food and eat up!'
            )
            .setThumbnail(
                'https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg'
            )
            .setImage(
                'attachment://sahur.gif'
            )
            .setTimestamp()
            .setFooter({ text: '@2026 Islamic Board of Sanctum', iconURL: 'https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg' });

        let sentEmbed;
        try {
            sentEmbed = await channel.send({ content: `<@&${process.env.ROLE_ID}>`, embeds: [Announcement], files: [sahurGif] }); // Send the embed to channel || Set attachment for setImage params
            setTimeout(async () => {
                try {
                    await sentEmbed.delete();
                    console.log('Deleted sahur embed');
                } catch (e) {
                    console.error('Failed to delete sahur embed:', e);
                }
            }, 3600000 ); // Delete after 1 hour (3600000 milliseconds)
            await interaction.reply({ content: 'Sahur Initialisation Successful', ephemeral: true }); // Get rid of 'application did not respond' message || Confirmation message
        } catch (e) {
            await interaction.reply({ content: 'Sahur Initialisation Failed', ephemeral: true });
        }

    }
}