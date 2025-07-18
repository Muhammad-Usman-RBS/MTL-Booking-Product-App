import jwt from 'jsonwebtoken';

const generateToken = (id, role, companyId) => {
  return jwt.sign({ id, role, companyId }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });
};

export default generateToken;
