import jwt from "jsonwebtoken";
export const requireAuth = (allowedRoles = []) => {
    return (req, res, next) => {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token)
                throw new Error("Missing token");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Check if role is allowed
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                throw new Error("Insufficient permissions");
            }
            // Attach user to request
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                restaurantId: decoded.restaurantId,
            };
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: error.message || "Authentication failed",
            });
        }
    };
};
