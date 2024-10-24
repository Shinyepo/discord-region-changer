const { EmbedBuilder } = require("discord.js");

module.exports.FormatRegion = (regionId) => {
  if (regionId == null) return "Automatic";
  if (regionId == "hongkong") return "Hong Kong";
  else
    return String(regionId).charAt(0).toUpperCase() + String(regionId).slice(1);
};

module.exports.BuiltEmbed = (regionId) => {
  const region = this.FormatRegion(regionId);
  const embed = new EmbedBuilder()
    .setTitle("Voice Region Changer")
    .setDescription("Choose a region for this voice channel.")
    .addFields({
      name: "Current region",
      value: region,
    });
  return embed;
};
