import React from "react";
import { Box, Typography, Container } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import { styled } from "@mui/material/styles";

const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  textAlign: "center",
  backgroundColor: "#f5f5f5",
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.5,
    },
    "100%": {
      opacity: 1,
    },
  },
}));

const RetryButton = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  backgroundColor: "#1976d2",
  color: "white",
  borderRadius: theme.spacing(1),
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#1565c0",
    transform: "translateY(-2px)",
  },
}));

function NoInternet() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <StyledContainer maxWidth="sm">
      <IconWrapper>
        <WifiOffIcon sx={{ fontSize: 80, color: "#666" }} />
      </IconWrapper>
      
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#333",
          marginBottom: 2,
        }}
      >
        No Internet
      </Typography>
      
      <Typography
        variant="h6"
        component="p"
        sx={{
          color: "#666",
          marginBottom: 1,
          maxWidth: 400,
        }}
      >
        Please check your internet connection and try again.
      </Typography>
      
      <Typography
        variant="body1"
        component="p"
        sx={{
          color: "#888",
          marginBottom: 3,
        }}
      >
        Make sure you're connected to the internet to access the dashboard.
      </Typography>

      <RetryButton onClick={handleRetry}>
        <RefreshIcon />
        <Typography variant="button">Retry</Typography>
      </RetryButton>
    </StyledContainer>
  );
}

export default NoInternet;
