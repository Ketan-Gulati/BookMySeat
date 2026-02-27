export const verifyAdmin = (req, _, next) => {
    if (req.user.role !== "ADMIN") {
        throw new ApiError(403, "Admin access required");
    }
    next();
};