import JWT from 'jsonwebtoken';

const tokenFromCookie = (cookieHeader = "") => cookieHeader
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === "ss_session")?.[1];

export const requireSignIn = async (req,res,next) => {
    try {
        const header = req.headers.authorization;
        const headerToken = header?.startsWith("Bearer ") ? header.slice(7).trim() : header;
        const token = headerToken || tokenFromCookie(req.headers.cookie);
        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const decoded = JWT.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        if (decoded.scope && decoded.scope !== "access") {
            return res.status(401).json({ success: false, message: "Invalid authentication token" });
        }
        req.user=decoded;
        req.authToken=token;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
    }
}
