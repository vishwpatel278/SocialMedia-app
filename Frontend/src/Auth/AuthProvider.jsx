import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext({
  user: null,
  handleLogin: () => {},
  handleLogout: () => {}
});

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      return jwtDecode(token);
    }

    return null;
  });

  const handleLogin = (token) => {
    
    try {
      const decodedUser = jwtDecode(token);
      console.log(decodedUser)
      sessionStorage.setItem("userId", decodedUser.id);
      sessionStorage.setItem("userRole", JSON.stringify(decodedUser.role));
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("username", decodedUser.username);
      
      setUser(decodedUser);

    } catch(err) {
      console.log("Invalid token");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};