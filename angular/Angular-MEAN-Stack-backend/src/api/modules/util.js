import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { devConfig } from '../../config/env/development';

export const getJwtToken = (payload) => {
    const token = jwt.sign(payload, devConfig.secret, {
        expiresIn: "1d",
      });
      return token;
}

export const getEncryptedPassword = async password => {
  const salt = await bcryptjs.genSalt();
  const hash = await bcryptjs.hash(password, salt);
  return hash;
};