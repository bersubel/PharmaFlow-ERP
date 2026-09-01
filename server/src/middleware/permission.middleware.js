const permission = (requiredPermission) => {
    return (req, res, next) => {
        // User must be authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const permissions =
            req.user.role?.permissions || [];

        /*
         * Normal permission check
         */
        if (permissions.includes(requiredPermission)) {
            return next();
        }

        /*
         * SALES MANAGEMENT HIERARCHY
         *
         * sales.manage gives full sales access,
         * including sales.create.
         *
         * Therefore:
         *
         * Admin / Manager:
         *     sales.manage
         *
         * Pharmacist / Cashier:
         *     sales.create
         */
        if (
            requiredPermission.startsWith("sales.") &&
            permissions.includes("sales.manage")
        ) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message:
                "You do not have permission to perform this action",
        });
    };
};

module.exports = permission;