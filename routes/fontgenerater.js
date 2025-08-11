const userModel = require('../dbs/userSchema');
const generateFont = require("../FontGenerate");
const path = require('path');
const fs = require('fs');

async function fontgenerator(req, res) {
  let email=req.body.email;
    try {
        const user=await userModel.findOne({ email });
        if(user.isPaid===false){
          if(user.fontsGenerated>0){
            return res.status(403).json({ success: false, error: "Font generation limit reached" });
          }
        }
        if(user.isPaid===true){
          if(user.fontLimit<=user.fontsGenerated){
            return res.status(403).json({ success: false, error: "Cannot Generate More" });
          }
        }
        const result = await generateFont(email);
        const fontName = "handwriting";
        const fontPath = path.join(__dirname, "../download_folder", email, "Myfont-Regular.ttf");
        const fontBuffer = fs.readFileSync(fontPath);
        const updatedUser = await userModel.findOneAndUpdate(
      { email },
      {
        fontsGenerated: user.fontsGenerated + 1,
        fontData: fontBuffer,
        fontMimeType: "font/ttf",
        fontName: fontName
      },
      { new: true, upsert: true }
    );
    const fontUrl = `/fonts/${updatedUser._id}`; // will serve from this route
    res.json({
      success: true,
      fontUrl: fontUrl,
      fontsGenerated: user.fontsGenerated+1
    });
    } catch (err) {
        console.error(err);
    res.status(500).json({ success: false, error: "Font generation failed" });
    }
     finally {
      
        const filePath = path.resolve(__dirname, `../uploads/${email}.png`); 
    // Delete the file if it exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting file:', unlinkErr);
          } else {
            console.log('Uploaded file deleted:', filePath);
          }
        });
        
      }
      
    });
    const emailFolderPath = path.join(__dirname, "../download_folder", email);

    fs.rm(emailFolderPath, { recursive: true, force: true }, (rmErr) => {
      if (rmErr) {
        console.error("Error deleting email folder:", rmErr);
      } else {
        console.log("Email folder deleted:", emailFolderPath);
      }
    });
  }
}

module.exports = fontgenerator;