const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]; // ✅ لاحظ الفراغ وليس ""
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ status: false, message: "Token is not valid" });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ status: false, message: "You are not authenticated!" });
    }
};

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (
            req.user.userType === 'Client' ||
            req.user.userType === 'Admin' ||
            req.user.userType === 'Vendor' ||
            req.user.userType === 'Driver'
        ) {
            next();
        } else {
            return res.status(401).json({ status: false, message: "You are not allowed to access this route" });
        }
    }
);
};

const verifyVendor = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userType === 'Admin' || req.user.userType === 'Vendor') {
            next();
        } else {
            return res.status(401).json({ status: false, message: "You are not allowed to access this route" });
        }
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userType === 'Admin') {
            next();ges
            
        } else {
            return res.status(401).json({ status: false, message: "You are not allowed to access this route" });
        }
    });
};

const verifyDriver = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userType === 'Driver') {
            next();
        } else {
            return res.status(401).json({ status: false, message: "You are not allowed to access this route" });
        }
    });
};

module.exports = { verifyTokenAndAuthorization, verifyVendor, verifyAdmin, verifyDriver };
