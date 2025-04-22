// middleware/providerAuth.js
import { User } from '../models/index.js';

export const providerOnly = async (req, res, next) => {
    try {
        // 1. Get the authenticated user's ID from req.user (set by your auth middleware)
        const userId = req.user.id;

        // 2. Find the user in database
        const user = await User.findByPk(userId, {
            attributes: ['id', 'isprovider'] // Only fetch what we need
        });

        // 3. If user doesn't exist or isn't a provider, deny access
        if (!user || !user.isprovider) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Provider account required.'
            });
        }

        // 4. If user is a provider, proceed to the next middleware/controller
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying provider status',
            error: error.message
        });
    }
};