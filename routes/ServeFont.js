const userModel = require("../dbs/userSchema");
async function serveFont(req, res) {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user || !user.fontData) {
      return res.status(404).send("Font not found");
    }

    res.set("Content-Type", user.fontMimeType);
    res.send(user.fontData);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching font");
  }
}
module.exports = serveFont;