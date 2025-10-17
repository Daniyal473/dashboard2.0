import React from 'react';
import MDBox from './MDBox';

const Logo = ({ 
  width = "auto", 
  height = "100px", 
  maxWidth = "350px",
  sx = {},
  ...props 
}) => {
  // Use environment variable if available, otherwise use public folder path
  const logoSrc = process.env.REACT_APP_LOGO_URL || '/img/custom-logo.png';

  return (
    <MDBox
      component="img"
      src={logoSrc}
      alt="Namuve Logo"
      sx={{
        height,
        width,
        maxWidth,
        ...sx
      }}
      {...props}
    />
  );
};

export default Logo;
