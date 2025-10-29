// import React, { createContext, useContext, useState } from 'react'

// // Tạo ra một context mới
// const AuthContext = createContext();

// // Hook để lấy dữ liệu từ AuthContext
// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(() => {
//         const savedUser = localStorage.getItem("user");
//         return savedUser ? JSON.parse(savedUser) : null;
//     });

//     const login = async (username, password) => {
//         try {
//             const res = await fetch('http://localhost:5000/api/Auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//               body: JSON.stringify({
//                     username: username.trim(),
//                     password: password.replace(/\n/g, "").trim()
//                     })

//             });

//             const data = await res.json();
//             console.log(data);

//             if (res.ok && data.success) {
//                 const loginData = data.data;
//                 setUser(loginData.user);
//                 localStorage.setItem('user', JSON.stringify(loginData.user));
//                 localStorage.setItem('token', loginData.token);
//                 return { success: true };
//             } else {
//                 const message = data.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
//                 return { success: false, message };
//             }
//         } catch (error) {
//             console.error('Login error:', error);
//             return { success: false, message: 'Network error' };
//         }
//     }

//     const logout = () => {
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 🟢 LOGIN
  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.replace(/\n/g, "").trim(),
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok && data.success) {
        const loginData = data.data;

        setUser(loginData.user);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("token", loginData.token);

        // 🔑 Lưu refresh token vào SESSION STORAGE (chỉ tồn tại đến khi tắt trình duyệt)
        if (loginData.refreshToken)
          sessionStorage.setItem("refreshToken", loginData.refreshToken);

        scheduleTokenRefresh(loginData.token); // 🔔 đặt lịch refresh
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

  // 🟡 REFRESH TOKEN
  const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem("refreshToken"); // 🟢 Lấy từ sessionStorage
    if (!refreshToken) return null;

    try {
      const res = await fetch("http://localhost:5000/api/Auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newToken = data.data.token;
        localStorage.setItem("token", newToken);
        console.log("✅ Token refreshed");

        scheduleTokenRefresh(newToken); // 🔔 đặt lại timer mới
        return newToken;
      } else {
        console.warn("Refresh token failed:", data.message);
        logout();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return null;
    }
  };

  // 🔴 LOGOUT
  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:5000/api/Auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.warn("Logout API failed:", error);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken"); // 🟢 remove session token
    setUser(null);
    clearScheduledRefresh();
  };

  // 🧠 Decode JWT
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  // ⏰ Schedule refresh
  let refreshTimer;
  const scheduleTokenRefresh = (token) => {
    clearScheduledRefresh();
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return;

    const expTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const refreshTime = expTime - currentTime - 2 * 60 * 1000; // refresh sớm 2 phút

    if (refreshTime > 0) {
      console.log(
        `🕒 Token sẽ được refresh sau ${Math.round(refreshTime / 1000)}s`
      );
      refreshTimer = setTimeout(refreshAccessToken, refreshTime);
    } else {
      refreshAccessToken();
    }
  };

  const clearScheduledRefresh = () => {
    if (refreshTimer) clearTimeout(refreshTimer);
  };

  // 🔁 Khi reload trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (user && token) {
      scheduleTokenRefresh(token);
    }
    return clearScheduledRefresh;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
