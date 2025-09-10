import React, { createContext, useContext, useState } from 'react';
import LoadingEffect from './LoadingEffect';

// Create Loading Context
const LoadingContext = createContext();

// Loading Provider Component
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingConfig, setLoadingConfig] = useState({
    size: 'medium',
    theme: 'light'
  });

  const showLoading = (message = 'Loading...', config = {}) => {
    setLoadingMessage(message);
    setLoadingConfig(prev => ({ ...prev, ...config }));
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const value = {
    loading,
    showLoading,
    hideLoading,
    loadingMessage,
    loadingConfig
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && (
        <LoadingEffect
          overlay={true}
          message={loadingMessage}
          size={loadingConfig.size}
          theme={loadingConfig.theme}
        />
      )}
    </LoadingContext.Provider>
  );
};

// Custom Hook to use Loading
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// HOC for automatic loading on route changes
export const withLoading = (WrappedComponent) => {
  return (props) => {
    const [componentLoading, setComponentLoading] = useState(true);

    React.useEffect(() => {
      // Simulate component loading
      const timer = setTimeout(() => {
        setComponentLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }, []);

    if (componentLoading) {
      return (
        <LoadingEffect
          overlay={false}
          message="Loading page..."
          size="medium"
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
};