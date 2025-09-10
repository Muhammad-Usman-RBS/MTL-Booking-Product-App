import React from 'react';

const LoadingEffect = ({ 
  size = 'medium', 
  overlay = false, 
  message = 'Loading...', 
  showMessage = true,
  theme = 'light' 
}) => {
  const sizeClasses = {
    small: 'mtl-loading-small',
    medium: 'mtl-loading-medium',
    large: 'mtl-loading-large'
  };

  const themeClass = theme === 'dark' ? 'mtl-loading-dark' : 'mtl-loading-light';

  const LoadingComponent = () => (
    <div className={`mtl-loading-container ${sizeClasses[size]} ${themeClass}`}>
      <div className="mtl-loading-animation">
        <div className="mtl-car-container">
          <div className="mtl-car">
            <div className="mtl-car-body"></div>
            <div className="mtl-car-top"></div>
            <div className="mtl-wheels">
              <div className="mtl-wheel mtl-wheel-front"></div>
              <div className="mtl-wheel mtl-wheel-back"></div>
            </div>
          </div>
        </div>
        <div className="mtl-dots">
          <div className="mtl-dot"></div>
          <div className="mtl-dot"></div>
          <div className="mtl-dot"></div>
        </div>
      </div>
      {showMessage && (
        <div className="mtl-loading-message">
          <span>{message}</span>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={`mtl-loading-overlay ${themeClass}`}>
        <LoadingComponent />
      </div>
    );
  }

  return <LoadingComponent />;
};

export default LoadingEffect;