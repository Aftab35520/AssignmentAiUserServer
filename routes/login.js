const userModel = require('../dbs/userSchema');

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({status:false, message: 'User not found' });
        }

        if (user.password === password) {
            const UserLogin = {
                _id: user._id,
                name: user.name,
                email: user.email,
                isPaid: user.isPaid,
                fontLimit: user.fontLimit,
                fontsGenerated: user.fontsGenerated,
                
            };

            return res.status(200).json({
                status:true,
                message: 'Login success',
                user: UserLogin
            });
        } else {
            return res.status(401).json({status:false, message: 'Incorrect password' });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({status:false, message: 'Server error' });
    }
}

module.exports = login;
