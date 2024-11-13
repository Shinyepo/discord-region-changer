const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription(
      "Rejestracja użytkownika w gildii nadająca odpowienie role."
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("Użytkownik do zarejestrowania")
        .setRequired(true)
    ),
  async execute(interaction) {
    const option = interaction.options.getUser("target");
    const member = interaction.guild.members.cache.find(
      (x) => x.id === option.id
    );
    const logChannel = interaction.guild.channels.cache.find(x=>x.id === "1305555656706752512");
    if (member) {
      await member.roles.remove("1298945455144566825"); //guest perm
      await member.roles.remove("1298973096333676635"); //friend

      await member.roles.add("1298945381790646283"); //member perm
      await member.roles.add("1298972489203847209"); //member
      await interaction.reply({
        content: `Poprawnie zarejestrowano użytkownika ${member.toString()}`,
        ephemeral: true,
      })
      if (logChannel){
        await logChannel.send(interaction.user.username + " zarejestrował/a użytkownika w gildii " + member.toString());
      }
      return console.log(
        interaction.user.toString() +
          " registered a new member: " +
          member.toString()
      );
    }
    await interaction.reply({
      content: "Coś sie zesrało, męcz dupe <@190561911492968448> żeby naprawił.",
      ephemeral: true,
    });
    return console.log("failed to find member" + option.id);
  },
};
