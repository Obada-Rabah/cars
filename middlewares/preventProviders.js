// middleware/preventProviderAction.js
import { User } from '../models/index.js';

export const preventProviderAction = async (req, res, next) => {
    try {
        // 1. Get the authenticated user's ID from req.user (set by your auth middleware)
        const userId = req.user.id;

        // 2. Find the user in the database
        const user = await User.findByPk(userId, {
            attributes: ['id', 'isprovider'] // Only fetch the necessary attributes
        });

        // 3. If user doesn't exist or is a provider, deny access
        if (!user || user.isprovider) {
            return res.status(403).json({
                success: false,
                message: 'Providers are not allowed to perform this action.'
            });
        }

        // 4. If user is not a provider, proceed to the next middleware/controller
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying provider status',
            error: error.message
        });
    }
};
