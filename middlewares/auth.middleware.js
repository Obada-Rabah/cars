import jwt from 'jsonwebtoken';


export function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1]; // 👈 this gets just the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('JWT Verification Error:', err);
            return res.status(403).json({ message: 'Forbidden' });
        }
    
        console.log('Verified User Payload:', user); // 👈 log this
        req.user = user;
        next();
    });
    
}
