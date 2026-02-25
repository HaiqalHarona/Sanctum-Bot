import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import tarawih_db from '../../Controllers/tarawih_db_controller.js';

// This Whole Command was made by Antigravity (Testing it)

export default {
	data: new SlashCommandBuilder()
		.setName('tarawih-stats')
		.setDescription('📊 View fun Tarawih attendance stats for the group!'),

	async execute(interaction) {
		await tarawih_db.read();

		const tarawihData = tarawih_db.data.tarawih || [];
		const userData = tarawih_db.data.user || [];

		// ── Basic counts ────────────────────────────────────────────────
		const totalRecords = tarawihData.length;
		const totalPresent = tarawihData.filter(r => r.status === 'present').length;
		const totalAbsent = tarawihData.filter(r => r.status === 'absent').length;
		const totalMembers = userData.length;

		// ── Unique session dates ─────────────────────────────────────────
		const uniqueDates = [...new Set(tarawihData.map(r => r.date))].sort((a, b) => {
			const [ad, am, ay] = a.split('/').map(Number);
			const [bd, bm, by] = b.split('/').map(Number);
			return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
		});
		const totalSessions = uniqueDates.length;

		// ── Attendance rate ──────────────────────────────────────────────
		const attendanceRate = totalRecords > 0
			? ((totalPresent / totalRecords) * 100).toFixed(1)
			: '0.0';

		// ── Fun facts ────────────────────────────────────────────────────
		const funFact = totalRecords === 0
			? '🌙 No data yet — be the first to attend Tarawih!'
			: totalPresent === totalRecords
				? '🔥 SUBHANALLAH! 100% attendance — this group is on FIRE!'
				: totalAbsent > totalPresent
					? '😬 More absences than presences… come on guys, let\'s go! 🕌'
					: '💪 Keep it up — the group is doing great this Ramadan!';

		// ── Participation Board ──────────────────────────────────────────
		// Fetch each registered user's guild member to get display name + avatar
		const guild = interaction.guild;

		const participationLines = await Promise.all(
			userData.map(async (u, index) => {
				const presentCount = tarawihData.filter(r => r.id === u.id && r.status === 'present').length;
				const absentCount = tarawihData.filter(r => r.id === u.id && r.status === 'absent').length;
				const totalUserSessions = presentCount + absentCount;
				const rate = totalUserSessions > 0
					? ((presentCount / totalUserSessions) * 100).toFixed(0)
					: '0';

				// Try to resolve display name from the guild
				let displayName = u.name; // fallback to db name
				try {
					const member = await guild.members.fetch(u.id);
					displayName = member.displayName;
				} catch {
					// User may have left the server — keep db name
				}

				const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
				return `${medal} **${displayName}** — ✅ ${presentCount}  ❌ ${absentCount}  (${rate}%)`;
			})
		);

		// Sort by most present sessions (descending)
		const sortedUsers = [...userData]
			.map(u => ({
				...u,
				presentCount: tarawihData.filter(r => r.id === u.id && r.status === 'present').length,
			}))
			.sort((a, b) => b.presentCount - a.presentCount);

		const boardLines = await Promise.all(
			sortedUsers.map(async (u, index) => {
				const presentCount = tarawihData.filter(r => r.id === u.id && r.status === 'present').length;
				const absentCount = tarawihData.filter(r => r.id === u.id && r.status === 'absent').length;
				const totalUserSessions = presentCount + absentCount;
				const rate = totalUserSessions > 0
					? ((presentCount / totalUserSessions) * 100).toFixed(0)
					: '0';

				let displayName = u.name;
				try {
					const member = await guild.members.fetch(u.id);
					displayName = member.displayName;
				} catch {
					// Left the server
				}


			})
		);

		const boardField = boardLines.length > 0
			? boardLines.join('\n')
			: '_No members registered yet_';

		// ── Fetch invoker's avatar for thumbnail if possible ─────────────
		let thumbnailUrl = 'https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg';

		// ── Build Embed ──────────────────────────────────────────────────
		const embed = new EmbedBuilder()
			.setColor(0xC27C0E)
			.setTitle('🕌 Tarawih Stats — Sanctum Ramadan 2026')
			.setThumbnail(thumbnailUrl)
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

			)
			.setFooter({ text: 'Islamic Board of Sanctum • Ramadan 2026', iconURL: 'https://i.pinimg.com/736x/28/03/50/28035028b267f359e68e1597b6a50c0d.jpg' })
			// .setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};