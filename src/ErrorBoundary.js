import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null, errorInfo: null };
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
  
    componentDidCatch(error, errorInfo) {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
      this.setState({ errorInfo });
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div>
            <h1>Something went wrong. Please try again later.</h1>
            {this.state.error && <p>Error: {this.state.error.message}</p>}
            {this.state.errorInfo && (
              <pre>{this.state.errorInfo.componentStack}</pre>
            )}
          </div>
        );
      }
  
      return this.props.children;
    }
  }
  
  export default ErrorBoundary;
  
