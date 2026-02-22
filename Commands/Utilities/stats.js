import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../../database_ctrl.js';

// This Whole Command was made by Antigravity (Testing it)

export default {
	data: new SlashCommandBuilder()
		.setName('tarawih-stats')
		.setDescription('📊 View fun Tarawih attendance stats for the group!'),

	async execute(interaction) {
		await db.read();

		const tarawihData = db.data.tarawih || [];
		const userData = db.data.user || [];

		// ── Basic counts ────────────────────────────────────────────────
		const totalRecords = tarawihData.length;
		const totalPresent = tarawihData.filter(r => r.status === 'present').length;
		const totalAbsent = tarawihData.filter(r => r.status === 'absent').length;
		const totalMembers = userData.length;

		// ── Unique session dates ─────────────────────────────────────────
		const uniqueDates = [...new Set(tarawihData.map(r => r.date))].sort((a, b) => {
			// Parse dd/mm/yyyy
			const [ad, am, ay] = a.split('/').map(Number);
			const [bd, bm, by] = b.split('/').map(Number);
			return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
		});
		const totalSessions = uniqueDates.length;



		// ── Attendance rate ──────────────────────────────────────────────
		const attendanceRate = totalRecords > 0
			? ((totalPresent / totalRecords) * 100).toFixed(1)
			: '0.0';

		// ── Absences per date ────────────────────────────────────────────
		const absentByDate = {};
		for (const record of tarawihData) {
			if (record.status === 'absent') {
				absentByDate[record.date] = (absentByDate[record.date] || 0) + 1;
			}
		}

		// Build the absent-per-date field (most recent 5 dates to avoid overflow)
		const absentLines = uniqueDates
			.slice(-5)
			.map(date => {
				const presentCount = tarawihData.filter(r => r.date === date && r.status === 'present').length;
				const absentCount = tarawihData.filter(r => r.date === date && r.status === 'absent').length;
				const bar = '🟩'.repeat(presentCount) + '🟥'.repeat(absentCount);
				return `**${date}** — ✅ ${presentCount}  ❌ ${absentCount}  ${bar}`;
			});

		const absentField = absentLines.length > 0
			? absentLines.join('\n')
			: '_No sessions recorded yet_';



		// ── Fun facts ────────────────────────────────────────────────────
		const funFact = totalRecords === 0
			? '🌙 No data yet — be the first to attend Tarawih!'
			: totalPresent === totalRecords
				? '🔥 SUBHANALLAH! 100% attendance — this group is on FIRE!'
				: totalAbsent > totalPresent
					? '😬 More absences than presences… come on guys, let\'s go! 🕌'
					: '💪 Keep it up — the group is doing great this Ramadan!';

		// ── Build Embed ──────────────────────────────────────────────────
		const embed = new EmbedBuilder()
			.setColor(0xC27C0E) // Gold / Ramadan colour
			.setTitle('🕌 Tarawih Stats — Sanctum Ramadan 2026')
			.setThumbnail('https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg')
			.setDescription(`*"Whoever prays during the nights of Ramadan out of sincere faith and seeking reward, his past sins will be forgiven."* — Sahih al-Bukhari\n\n${funFact}`)
			.addFields(
				{
					name: '📈 Overview',
					value: [
						`🗓️ **Total Sessions:** ${totalSessions}`,
						`👥 **Registered Members:** ${totalMembers}`,
						`✅ **Total Present:** ${totalPresent}`,
						`❌ **Total Absent:** ${totalAbsent}`,
						`📊 **Attendance Rate:** ${attendanceRate}%`,
					].join('\n'),
					inline: false,
				},
				{
					name: `📅 Attendance by Date ${uniqueDates.length > 5 ? '(last 5 sessions)' : ''}`,
					value: absentField,
					inline: false,
				},
			);



		embed
			.setFooter({ text: 'Islamic Board of Sanctum • Ramadan 2026', iconURL: 'https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg' })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};