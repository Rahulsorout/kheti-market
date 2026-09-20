import {
  createContext,
  useState,
  useContext,
} from "react";

import { loginUser } from "../services/authService";

const AuthContext = createContext();

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    localStorage.removeItem("user");

    return null;
  }
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    getStoredUser()
  );


  // =====================================================
  // LOGIN
  // =====================================================

  async function login(userData) {
    const result = await loginUser(userData);

    const newToken = result.data.token;
    const newUser = result.data.user;

    // Store authentication data
    localStorage.setItem(
      "token",
      newToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    // Update React state
    setToken(newToken);
    setUser(newUser);

    return result;
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }


  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        setToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}

export {
  AuthProvider,
};

export default AuthContext;