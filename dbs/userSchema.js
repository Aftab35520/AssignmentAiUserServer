const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  isPaid: { type: Boolean, default: false },
  fontLimit: { type: Number, default: 3 }, 
  fontsGenerated: { type: Number, default: 0 }, 
  fontPath: { type: String, default: "" },
  fontData: { type: Buffer, default: null }, // Store font binary directly
  fontMimeType: { type: String, default: "" }, // e.g., "font/ttf"
  fontName: { type: String, default: "" },
   paymentDate: { type: Date },
  paymentId: { type: String }, // razorpay_payment_id
  orderId: { type: String },   // razorpay_order_id
  paymentSignature: { type: String } 
}
)

const userModel=mongoose.model('AssignmentAiUserData',userSchema)

module.exports=userModel