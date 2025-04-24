const createCategory = (req, res) => {
    const { restaurant_id } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res
            .status(401)
            .json({ error: "Invalid token format. Use 'Bearer <token>'" });
    }
};
export {};
