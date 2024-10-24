const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const { BuiltEmbed } = require("../../message/messageBuilder");

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup region changer for voice channels.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const guild = interaction.guild;
    const channels = guild.channels.cache.filter((x) => {
      if (x.isVoiceBased()) return x;
    });

    if (channels.size > 0) {
      const automatic = new ButtonBuilder()
        .setCustomId("automatic")
        .setLabel("Automatic")
        .setStyle(ButtonStyle.Secondary);
      const russia = new ButtonBuilder()
        .setCustomId("russia")
        .setLabel("Russia")
        .setStyle(ButtonStyle.Secondary);
      const rotterdam = new ButtonBuilder()
        .setCustomId("rotterdam")
        .setLabel("Rotterdam")
        .setStyle(ButtonStyle.Secondary);
      const hongkong = new ButtonBuilder()
        .setCustomId("hongkong")
        .setLabel("Hong Kong")
        .setStyle(ButtonStyle.Secondary);
      const brazil = new ButtonBuilder()
        .setCustomId("brazil")
        .setLabel("Brazil")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(
        automatic,
        russia,
        rotterdam,
        hongkong,
        brazil
      );
      channels.forEach(async (channel) => {
        const embed = BuiltEmbed(channel.rtcRegion);

        await channel.send({ embeds: [embed], components: [row] });
      });
      await interaction.reply({
        content: "Region change message setup complete.",
        ephemeral: true,
      });
    }
  },
};
