const userModel = require('../dbs/userSchema');

async function registration(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existing = await userModel.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const NewUser = new userModel({
            name,
            email,
            password,
            isPaid: false,
            fontLimit: 3,
            fontsGenerated: 0,
            fontPath: ""
        });

        await NewUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (e) {
        console.error("Registration error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = registration;
