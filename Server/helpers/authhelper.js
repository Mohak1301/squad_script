import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
    try {
        const saltround = 10;
        const hashedpassword = await bcrypt.hash(password, saltround);
        return hashedpassword;
    } catch (error) {
        throw error;
    }
}

export const comparePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
}
