export const getUserInfo = (req, res) => {
    if (!req.user) {
        return res.status(404).send("User not found 123");
    }
    res.status(200).json({
        success: true,
        name: req.user.name,
        phone_number: req.user.phoneNumber,
    });
};
