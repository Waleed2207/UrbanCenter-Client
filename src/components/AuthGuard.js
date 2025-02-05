const AuthGuard = ({ children }) => {
    const isAuthenticated = true; // Replace with actual logic
    return isAuthenticated ? children : <div>Please log in</div>;
  };
  
  export default AuthGuard;
  