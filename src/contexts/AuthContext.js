// import React, { createContext, useState, useEffect } from "react";
// import Cookies from "js-cookie";
// import axios from "axios";

// // Create AuthContext with default values
// const AuthContext = createContext();

// // AuthProvider component to wrap the component tree and provide authentication state
// export const AuthProvider = ({ children }) => {
//   // Initialize isAuthenticated state based on cookies
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     Cookies.get("isAuthenticated") === "true"
//   );

//   // Initialize user state based on cookies
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   const handleSignIn = (token, userData) => {
//     setIsAuthenticated(true);
//     const userWithToken = { ...userData, token };
//     setUser(userWithToken);

//     // ✅ Store user data in localStorage to persist after refresh
//     localStorage.setItem("user", JSON.stringify(userWithToken));
//     localStorage.setItem("token", token);
//     localStorage.setItem("isAuthenticated", "true");

//     // ✅ Store token in cookies for session management (optional)
//     Cookies.set("token", token, { expires: 1 });
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setUser(null);
    
//     // ✅ Clear user data from localStorage and sessionStorage
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     localStorage.removeItem("isAuthenticated");

//     Cookies.remove("token");

//     // ✅ Sync logout event across tabs
//     localStorage.setItem("logout-event", Date.now());
//   };


//   useEffect(() => {
//     const syncLogout = (event) => {
//       if (event.key === "logout-event") {
//         setIsAuthenticated(false);
//         setUser(null);
//         localStorage.clear();
//       }
//     };

//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//   }, []);

//   // // Sync tabs when the user logs in/out
//   // useEffect(() => {
//   //   const syncTabs = (event) => {
//   //     if (event.key.startsWith("user_") || event.key === "isAuthenticated") {
//   //       const storedUser = sessionStorage.getItem(`user_${user?._id}`);
//   //       setUser(storedUser ? JSON.parse(storedUser) : null);
//   //       setIsAuthenticated(sessionStorage.getItem("isAuthenticated") === "true");
//   //     }
//   //   };

//   //   window.addEventListener("storage", syncTabs);
//   //   return () => window.removeEventListener("storage", syncTabs);
//   // }, [user]);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const storedToken = localStorage.getItem("token");

//     if (storedUser && storedToken) {
//       setUser(JSON.parse(storedUser));
//       setIsAuthenticated(true);
//     }
//   }, []);


//   // Fetch user role if not already available
//   useEffect(() => {
//     if (user && !user.role) {
//       const fetchUserRole = async () => {
//         try {
//           const response = await axios.post("/api/users/login", {
//             email: user.email,
//             password: user.password
//           });
//           const updatedUser = {
//             ...user,
//             role: response.data.user.role,
//             space_id: response.data.user.space_id
//           };
//           setUser(updatedUser);
//           Cookies.set("user", JSON.stringify(updatedUser), { expires: 1 });
//         } catch (error) {
//           console.error("Error fetching user role:", error);
//         }
//       };

//       fetchUserRole();
//     }
//   }, [user]);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, user, setUser, handleSignIn, handleLogout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
// import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Restore session from localStorage if sessionStorage is cleared (on refresh)
  useEffect(() => {
    let sessionUserId = sessionStorage.getItem("sessionUserId");

    // 🔥 If the session was cleared (refresh case), restore from localStorage
    if (!sessionUserId) {
      sessionUserId = localStorage.getItem("lastUserId");
      if (sessionUserId) {
        sessionStorage.setItem("sessionUserId", sessionUserId);
      }
    }

    if (sessionUserId) {
      const storedUser = localStorage.getItem(`user_${sessionUserId}`);
      const storedToken = localStorage.getItem(`token_${sessionUserId}`);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleSignIn = (token, userData) => {
    const userId = userData._id;
    setIsAuthenticated(true);
    setUser(userData);

    // ✅ Store session per tab
    sessionStorage.setItem("sessionUserId", userId);

    // ✅ Store session in localStorage to restore after refresh
    localStorage.setItem("lastUserId", userId);
    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    localStorage.setItem(`token_${userId}`, token);

    Cookies.set(`token_${userId}`, token, { expires: 1 });

    // ✅ Notify other tabs that a login happened
    localStorage.setItem(`login-event-${userId}`, JSON.stringify({ userId, timestamp: Date.now() }));
  };

  const handleLogout = () => {
    if (!user) return; // ✅ Prevents errors if user is already null
  
    const userId = user._id;
  
    // ✅ Clear React state
    setIsAuthenticated(false);
    setUser(null);
  
    // ✅ Remove session data ONLY for this tab
    sessionStorage.removeItem("sessionUserId");
  
    // ✅ Remove user data from localStorage (Only if it exists)
    if (localStorage.getItem(`user_${userId}`)) {
      localStorage.removeItem(`user_${userId}`);
      localStorage.removeItem(`token_${userId}`);
    }
  
    // ✅ Remove `lastUserId` only if it's the currently logged-out user
    if (localStorage.getItem("lastUserId") === userId) {
      localStorage.removeItem("lastUserId");
    }
  
    // ✅ Remove token from cookies (Prevent API access after logout)
    Cookies.remove(`token_${userId}`);
  
    // ✅ Check if other tabs need to be logged out (Prevent redundant events)
    if (localStorage.getItem(`logout-event-${userId}`) === null) {
      localStorage.setItem(`logout-event-${userId}`, Date.now());
    }
  };

  
  // const handleLogout = () => {
  //   if (!user) return;

  //   const userId = user._id;
  //   setIsAuthenticated(false);
  //   setUser(null);

  //   // ✅ Remove only this tab’s session
  //   sessionStorage.removeItem("sessionUserId");

  //   // ✅ Remove user data from localStorage
  //   localStorage.removeItem(`user_${userId}`);
  //   localStorage.removeItem(`token_${userId}`);

  //   // ✅ Remove the last logged-in user only if this tab was the last active one
  //   if (localStorage.getItem("lastUserId") === userId) {
  //     localStorage.removeItem("lastUserId");
  //   }

  //   Cookies.remove(`token_${userId}`);

  //   // ✅ Notify other tabs that this user logged out
  //   localStorage.setItem(`logout-event-${userId}`, Date.now());
  // };

  // ✅ Sync login across tabs (only for the same user)
  useEffect(() => {
    const syncLogin = (event) => {
      if (event.key.startsWith("login-event-")) {
        const { userId } = JSON.parse(event.newValue);
        const sessionUserId = sessionStorage.getItem("sessionUserId");

        // ✅ Only update if it's the same user
        if (sessionUserId === userId) {
          const storedUser = localStorage.getItem(`user_${userId}`);
          const storedToken = localStorage.getItem(`token_${userId}`);

          if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        }
      }
    };

    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  // ✅ Sync logout across tabs (only for the same user)
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key.startsWith("logout-event-")) {
        const userId = event.key.replace("logout-event-", "");
        const sessionUserId = sessionStorage.getItem("sessionUserId");

        // ✅ Only log out if it's the same user
        if (sessionUserId === userId) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, handleSignIn, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
