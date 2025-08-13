const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const multer=require('multer')
require('dotenv').config();
const app=express()
app.use(express.json())
app.use(cors())
const crypto = require('crypto');
const Razorpay = require('razorpay');

//Routes Import
const registration=require('./routes/registeration')
const login=require("./routes/login")
const generatefont=require('./routes/fontgenerater')
const serveFont=require('./routes/ServeFont')
const userModel =require("./dbs/userSchema")
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


const razorpay = new Razorpay({
    key_id: 'rzp_live_8u3N66embKvoZO',
    key_secret: 'oB5Hi0pZKblZpFiP7yrFOQ8u'
});


app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 100, 
      currency: "INR",
      receipt: "receipt_order_" + Date.now()
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});


app.post("/verify-payment", async(req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

  const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", "oB5Hi0pZKblZpFiP7yrFOQ8u")
    .update(bodyData.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    console.log("✅ Payment Success for:", email);
     const updatedUser = await userModel.findOneAndUpdate(
        { email },
        {
          isPaid: true,
          paymentDate: new Date(),
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paymentSignature: razorpay_signature
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    console.log("updateHere"); // your DB update code
    return res.json({ success: true });
  } else {
    console.log("❌ Payment Failed for:", email);
    return res.status(400).json({ success: false, message: "Payment failed" });
  }
});

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