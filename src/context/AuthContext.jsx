import React, { createContext, useContext, useState } from "react";

// Tạo ra một context mới
const AuthContext = createContext();

// Hook để lấy dữ liệu từ AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.replace(/\n/g, "").trim(),
        }),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok && data.success) {
        const loginData = data.data;
        setUser(loginData.user);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("token", loginData.token);
        return { success: true };
      } else {
        const message =
          data.message || "Tên đăng nhập hoặc mật khẩu không đúng";
        return { success: false, message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
