const Profile = require('../models/profile');

const getProfile = async (req, res, next) => {
    const profileId = req.headers.profile_id;
    if(!profileId) return res.status(401).json({ error: 'Login to access' });
    const profile = await Profile.findOne({
        attributes: ['id', 'type'],
        where: {
            id: profileId || 0
        }
    });
    if(!profile) return res.status(404).json({ error: 'User not found' });
    req.profile = profile;
    next();
}
module.exports = getProfile;