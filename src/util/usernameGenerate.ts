import crypto from 'crypto';
import { User } from '../app/modules/user/user.model';

const generateUsername = async (name?: string) => {
    let base = name ? name.toLowerCase().replace(/\s/g, '') : 'user';
    let username = '';
    let exists = true;

    while (exists) {
        const random = crypto.randomBytes(3).toString('hex'); // 6 character random
        username = `${base}${random}`;
        const user = await User.findOne({ username });
        if (!user) exists = false; // unique হলে break
    }

    return username;
};

export default generateUsername;