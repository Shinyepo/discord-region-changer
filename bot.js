// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { token } = require("./config.json");
const { BuiltEmbed, FormatRegion } = require("./message/messageBuilder");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMembers,    
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount =
      (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  } else if (interaction.isButton()) {
    if (interaction.channel.isVoiceBased()) {
      const user = interaction.user;
      const guild = interaction.guild;
      const channel = guild.channels.cache.find(x=>x.id === interaction.channel.id);
      if (!channel) return console.log("missing channel");
      // console.log({guild: interaction.guild.id, intChannel: interaction.channel.id, channel: channel.id, membersc: channel.memberCount, members: channel.members });
      // console.log({intmemco: interaction.channel.members.size, memco: channel.members.size});
      //const channel = interaction.channel;
      const foundUser = channel.members.find((x) => x.id === user.id);
      
      if (channel.members.size < 1 || !foundUser) {
        return await interaction.reply({
          content:
            "You cant change region of a channel you are not connected to.",
          ephemeral: true,
        });
      }

      const { cooldowns } = interaction.client;

      if (!cooldowns.has(interaction.message.id.toString())) {

        cooldowns.set(interaction.message.id.toString(), new Collection());
      }
      const now = Date.now();
      const timestamps = cooldowns.get(interaction.message.id.toString());

      const cooldownAmount = 20 * 1_000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1_000);
          return interaction.reply({
            content: `Please wait, you are on a cooldown for changing regions. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      
      const buttonId = interaction.customId;
      const channels = interaction.guild.channels;
      const logChannel = channels.cache.find(x=>x.id === "1300574571337875456");
      const oldRegion = channel.rtcRegion;
      if (buttonId == "automatic" && channel.rtcRegion != null) {
        await channel.setRTCRegion(null);
        const embed = BuiltEmbed(buttonId);
        await interaction.update({ embeds: [embed] });
        await interaction.followUp({
          content: "Region has been changed to Automatic",
          ephemeral: true,
        });
        
        if (logChannel) {
          await logChannel.send(interaction.member.toString() + " has changed " + channel.toString() + " region from " + oldRegion + " to Automatic");
        }
        return;
      }
      if (channel.rtcRegion !== buttonId && buttonId !== "automatic") {
        await channel.setRTCRegion(buttonId);
        const formatted = FormatRegion(buttonId);
        const embed = BuiltEmbed(buttonId);
        await interaction.update({ embeds: [embed] });
        await interaction.followUp({
          content: "Region has been changed to " + formatted,
          ephemeral: true,
        });
        if (logChannel) {
          await logChannel.send(interaction.member.toString() + " has changed " + channel.toString() + " region from " + oldRegion + " to " + formatted);
        }
        return;
      } else {
        await interaction.reply({
          content: "Chosen region is already being used by this channel.",
          ephemeral: true,
        });
        return;
      }
    }
  }
});
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
