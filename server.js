const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const multer=require('multer')
require('dotenv').config();
const app=express()
app.use(express.json())
app.use(cors())

//Routes Import
const registration=require('./routes/registeration')
const login=require("./routes/login")
const generatefont=require('./routes/fontgenerater')
const serveFont=require('./routes/ServeFont')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
     const email = req.headers['email'];
    
    cb(null, `${email}.png`);
  },
});

const upload = multer({ storage: storage });

app.get("/",(req,res)=>{
    res.json({res:'ok'})
})

app.post("/registration",registration)
app.post("/login",login)
app.post("/generatefont", upload.single("file"),generatefont)
app.get("/fonts/:userId", serveFont)

async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not found in .env file");
        }
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log("✅ Server is running on port:", PORT);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    }
}

startServer();