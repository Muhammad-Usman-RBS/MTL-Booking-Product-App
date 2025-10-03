// ✅ Auto-inject companyId into body & query
export const injectCompanyId = (req, res, next) => {
  if (req.user && req.user.companyId) {
    // 📝 Body me inject karo agar missing ho
    if (!req.body.companyId) {
      req.body.companyId = req.user.companyId;
    }

    // 📝 Query me inject karo agar missing ho
    if (!req.query.companyId) {
      req.query.companyId = req.user.companyId;
    }
  }
  next();
};
