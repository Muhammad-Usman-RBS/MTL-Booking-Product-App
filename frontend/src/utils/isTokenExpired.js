// utils/checkTokenExpired.js
//  For JWT Token Expiry and LOgout 

export const isTokenExpired = (token) => {
    if (!token) return true;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() ;
      return payload.exp * 1000 < currentTime;
    } catch {
      return true; 
    }
  };
  