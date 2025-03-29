const User = require('../models/userModel');

const checkCredits = async (req, res, next) => {
    try {
        const userId = req.user._id; // Assuming auth middleware runs first
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.credits <= 0) {
            return res.status(403).json({ 
                message: 'Insufficient credits', 
                credits: user.credits 
            });
        }

        // Attach credits to request for later use
        req.userCredits = user.credits;
        next();
    } catch (error) {
        console.error('Credit Check Error:', error);
        res.status(500).json({ message: 'Error checking credits' });
    }
};

module.exports = checkCredits;