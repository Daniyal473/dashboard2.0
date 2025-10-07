/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Icon from "@mui/material/Icon";
import { keyframes } from "@mui/system";

// React
import React, { Component, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// CanvasJS Chart Component
class CanvasJSChart extends Component {
  constructor(props) {
    super(props);
    this.chart = null;
  }

  componentDidMount() {
    // Load CanvasJS from CDN
    if (!window.CanvasJS) {
      const script = document.createElement("script");
      script.src = "https://canvasjs.com/assets/script/canvasjs.min.js";
      script.onload = () => {
        this.renderChart();
      };
      document.head.appendChild(script);
    } else {
      this.renderChart();
    }
  }

  componentDidUpdate() {
    if (window.CanvasJS) {
      this.renderChart();
    }
  }

  renderChart() {
    if (window.CanvasJS && this.chartContainer) {
      this.chart = new window.CanvasJS.Chart(this.chartContainer, this.props.options);
      this.chart.render();
    }
  }

  render() {
    return (
      <div
        ref={(ref) => (this.chartContainer = ref)}
        style={{
          height: "400px",
          width: "100%",
          minHeight: "300px",
        }}
        className="revenue-chart-container"
      />
    );
  }
}

// PropTypes validation for CanvasJSChart
CanvasJSChart.propTypes = {
  options: PropTypes.object.isRequired,
};

// Responsive Chart Wrapper
function ResponsiveRevenueChart({ chartData }) {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenSize.width <= 768;
  const isSmallMobile = screenSize.width <= 480;
  const isTablet = screenSize.width > 768 && screenSize.width <= 1024;

  return (
    <RevenueChartComponent
      chartData={chartData}
      isMobile={isMobile}
      isSmallMobile={isSmallMobile}
      isTablet={isTablet}
      screenWidth={screenSize.width}
    />
  );
}

ResponsiveRevenueChart.propTypes = {
  chartData: PropTypes.array.isRequired,
};

// Revenue Chart Component with dynamic data
class RevenueChartComponent extends Component {
  render() {
    const { chartData, isMobile, isSmallMobile, isTablet, screenWidth } = this.props;

    const chartHeight = isSmallMobile ? 200 : isMobile ? 250 : isTablet ? 320 : 400;
    const chartWidth = isMobile ? Math.min(screenWidth - 40, 400) : undefined;

    const options = {
      animationEnabled: true,
      animationDuration: 1500,
      theme: "light2",
      backgroundColor: "transparent",
      height: chartHeight,
      width: chartWidth,
      title: {
        text: isMobile ? "Revenue Analytics" : "Revenue Performance Analytics",
        fontSize: isSmallMobile ? 12 : isMobile ? 14 : isTablet ? 16 : 20,
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
        fontColor: "#1e293b",
        margin: isMobile ? 5 : 15,
      },
      axisY: {
        title: isMobile ? "" : "Revenue Categories",
        titleFontSize: isMobile ? 10 : 14,
        titleFontFamily: "Inter, sans-serif",
        titleFontColor: "#64748b",
        labelFontSize: isSmallMobile ? 6 : isMobile ? 8 : 12,
        labelFontFamily: "Inter, sans-serif",
        labelFontColor: "#475569",
        tickLength: 0,
        lineThickness: 0,
        gridThickness: 0,
        labelMaxWidth: isSmallMobile ? 40 : isMobile ? 60 : 120,
        labelWrap: true,
        margin: isMobile ? 5 : 10,
      },
      axisX: {
        title: isMobile ? "" : "Amount (Rs)",
        titleFontSize: isMobile ? 10 : 14,
        titleFontFamily: "Inter, sans-serif",
        titleFontColor: "#64748b",
        labelFontSize: isMobile ? 9 : 12,
        labelFontFamily: "Inter, sans-serif",
        labelFontColor: "#475569",
        includeZero: true,
        labelFormatter: this.addSymbols,
        gridColor: "#e2e8f0",
        gridThickness: isMobile ? 0.5 : 1,
        tickLength: isMobile ? 3 : 5,
        lineColor: "#cbd5e1",
        lineThickness: 1,
      },
      toolTip: {
        backgroundColor: "#1e293b",
        fontColor: "white",
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
        cornerRadius: 8,
        borderThickness: 0,
        contentFormatter: function (e) {
          const entry = e.entries[0];
          const formattedValue =
            entry.dataPoint.y >= 1000000
              ? `Rs${(entry.dataPoint.y / 1000000).toFixed(1)}M`
              : entry.dataPoint.y >= 1000
              ? `Rs${Math.round(entry.dataPoint.y / 1000)}K`
              : `Rs${Math.round(entry.dataPoint.y)}`;
          return `<strong>${entry.dataPoint.label}</strong><br/>${formattedValue}`;
        },
      },
      data: [
        {
          type: "bar",
          indexLabelPlacement: isMobile ? "none" : "outside",
          indexLabelFontSize: isMobile ? 9 : 11,
          indexLabelFontFamily: "Inter, sans-serif",
          indexLabelFontColor: "#475569",
          indexLabelFormatter: function (e) {
            if (isMobile) return "";
            return e.dataPoint.y >= 1000000
              ? `Rs${(e.dataPoint.y / 1000000).toFixed(1)}M`
              : e.dataPoint.y >= 1000
              ? `Rs${Math.round(e.dataPoint.y / 1000)}K`
              : `Rs${Math.round(e.dataPoint.y)}`;
          },
          dataPoints: chartData.map((item) => ({
            y: item.value,
            label: isSmallMobile
              ? item.label.substring(0, 3)
              : isMobile
              ? item.label.substring(0, 6)
              : item.label,
            color: item.color,
          })),
        },
      ],
    };
    return (
      <div
        style={{
          width: "100%",
          height: chartHeight + "px",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "10px" : "0px",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <CanvasJSChart options={options} />
        </div>
      </div>
    );
  }

  addSymbols(e) {
    var suffixes = ["", "K", "M", "B"];
    var order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)), 0);
    if (order > suffixes.length - 1) order = suffixes.length - 1;
    var suffix = suffixes[order];
    return window.CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
  }
}

// PropTypes validation for RevenueChartComponent
RevenueChartComponent.propTypes = {
  chartData: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isSmallMobile: PropTypes.bool.isRequired,
  isTablet: PropTypes.bool.isRequired,
  screenWidth: PropTypes.number.isRequired,
};

function Revenue() {
  const [revenueData, setRevenueData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Hide on tablets and mobile

  const shimmer = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  `;

  // Fetch revenue data and monthly target data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = "http://localhost:5000";

        // Fetch revenue data
        console.log("🔗 Connecting to:", `${apiUrl}/api/revenue`);
        const revenueResponse = await fetch(`${apiUrl}/api/revenue`);
        console.log("📡 Revenue response status:", revenueResponse.status);
        const revenueResult = await revenueResponse.json();
        console.log("📊 Revenue API Result:", revenueResult);

        // Fetch monthly target data
        console.log("🔗 Connecting to:", `${apiUrl}/api/monthly-target`);
        const monthlyResponse = await fetch(`${apiUrl}/api/monthly-target`);
        console.log("📡 Monthly response status:", monthlyResponse.status);
        const monthlyResult = await monthlyResponse.json();
        console.log("📊 Monthly API Result:", monthlyResult);

        if (revenueResult.success) {
          setRevenueData(revenueResult.data);
        }

        if (monthlyResult.success) {
          setMonthlyData(monthlyResult.data);
        }

        if (revenueResult.success || monthlyResult.success) {
          setError(null);
        } else {
          setError("Failed to fetch data from backend");
        }
      } catch (err) {
        setError("Unable to connect to backend server");
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format currency values
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 1000000) {
      return `Rs ${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `Rs ${(numValue / 1000).toFixed(0)}K`;
    } else {
      return `Rs ${numValue.toFixed(0)}`;
    }
  };

  // Chart data based on backend response
  const getChartData = () => {
    const targetRevenue = 583000; // Rs583K (fixed daily target)
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 175480.55;
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 100406.13;
    const monthlyTarget = monthlyData ? monthlyData.monthlyTarget || 17500000 : 17500000; // Rs17.5M
    const monthlyAchieved = monthlyData ? monthlyData.totalMonthlyAchieved || 0 : 0;

    return [
      { label: "Actual Revenue", value: actualRevenue, color: "#A67C8A" }, // Mauve purple
      { label: "Expected Revenue", value: expectedRevenue, color: "#4A90A4" }, // Teal blue
      { label: "Target", value: actualRevenue + expectedRevenue, color: "#E85A4F" }, // Red
      { label: "Monthly Target", value: monthlyAchieved, color: "#20c997" }, // Green
      { label: "Daily Target", value: targetRevenue, color: "#7B7FB8" }, // Purple blue
    ];
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  // Revenue cards data based on backend response - Updated
  const getRevenueCards = () => {
    // Fixed target revenue - remains unchanged
    const targetRevenue = 583000; // Rs583K (fixed target)
    // API actual revenue from backend
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 0; // Rs175K (API actual)
    // Expected revenue from backend
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 0; // Rs100K (expected)
    const totalRevenue = revenueData ? parseFloat(revenueData.totalRevenue) || 0 : 0;
    const monthlyAchievedRevenue = monthlyData ? monthlyData.totalMonthlyAchieved || 0 : 0;
    const monthlyTarget = monthlyData ? monthlyData.monthlyTarget || 17500000 : 17500000;
    const occupancyRate = revenueData ? parseFloat(revenueData.occupancyRate) || 0 : 0;

    // Calculate achievement percentage based on combined actual + expected vs target
    const combinedAchieved = actualRevenue + expectedRevenue;
    const achievementProgress =
      targetRevenue > 0
        ? parseFloat(Math.min((combinedAchieved / targetRevenue) * 100, 100).toFixed(2))
        : 0;

    return [
      {
        title: "ACTUAL REVENUE",
        amount: formatCurrency(actualRevenue), // API Actual Revenue: 175480.55 PKR
        progress: achievementProgress, // Achievement progress
        color: "success",
        icon: "trending_up",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      },
      {
        title: "EXPECTED REVENUE",
        amount: formatCurrency(expectedRevenue), // Expected Revenue: 100406.13 PKR
        progress: achievementProgress, // Same achievement progress
        color: "info",
        icon: "schedule",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      },
      {
        title: "TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(targetRevenue), // Rs583K (fixed target)
          achieved: formatCurrency(combinedAchieved), // Combined actual + expected
        },
        progress: achievementProgress, // Achievement progress
        color: "primary",
        icon: "flag",
        gradient: "linear-gradient(135deg, #06d6a0 0%, #059669 100%)",
      },
      {
        title: "MONTHLY TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(monthlyTarget), // Monthly target from API
          achieved: formatCurrency(monthlyAchievedRevenue), // Monthly achieved revenue from Teable
        },
        progress: parseFloat(
          Math.min((monthlyAchievedRevenue / monthlyTarget) * 100, 100).toFixed(2)
        ),
        color: "warning",
        icon: "flag",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      },
      {
        title: "DAILY TARGET",
        amount: formatCurrency(targetRevenue), // Rs583K (fixed target)
        progress: parseFloat(Math.min((combinedAchieved / targetRevenue) * 100, 100).toFixed(2)),
        color: "error",
        icon: "flag",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      },
    ];
  };

  const revenueCards = getRevenueCards();

  // Skip loading state - show default values immediately

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar absolute isMini />
        <MDBox
          pt={6}
          pb={3}
          px={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <MDBox textAlign="center">
            <MDTypography variant="h4" color="error" mb={2}>
              Error Loading Data
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3}>
              {error}
            </MDTypography>
            <MDButton variant="contained" color="info" onClick={() => window.location.reload()}>
              Retry
            </MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sx={{
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <DashboardNavbar absolute isMini />
      <MDBox
        pt={6}
        pb={3}
        px={3}
        sx={{
          background: "#ffffff",
        }}
      >
        {/* Header Section */}
        <MDBox
          mb={5}
          sx={{
            position: "relative",
            zIndex: 10,
            background: "#ffffff",
            borderRadius: 4,
            p: 6,
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #06d6a0 50%, #ef4444 75%, #f59e0b 100%)",
              borderRadius: "4px 4px 0 0",
              zIndex: 1,
            },
          }}
        >
          <MDBox>
            <MDTypography
              variant="h2"
              sx={{
                color: "#1e293b",
                fontWeight: 800,
                fontSize: "2.5rem",
                mb: 1,
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              Revenue Performance
            </MDTypography>
            <MDTypography
              variant="h6"
              sx={{
                color: "#64748b",
                fontWeight: 500,
                fontSize: "1.125rem",
                letterSpacing: "0.025em",
              }}
            >
              Real-time insights and performance analytics
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Revenue Metrics Grid */}
        <MDBox
          display="flex"
          flexWrap="wrap"
          gap={3}
          sx={{
            position: "relative",
            zIndex: 2,
            "& > *": {
              flex: "1 1 calc(20% - 24px)",
              minWidth: "300px",
              maxWidth: "300px",
              "@media (max-width: 1200px)": {
                flex: "1 1 calc(33.333% - 24px)",
                maxWidth: "300px",
              },
              "@media (max-width: 900px)": {
                flex: "1 1 calc(50% - 24px)",
                maxWidth: "300px",
              },
              "@media (max-width: 600px)": {
                flex: "1 1 100%",
                maxWidth: "100%",
              },
            },
          }}
        >
          {revenueCards.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: "200px",
                minHeight: "200px",
                maxHeight: "200px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s ease-in-out",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #cbd5e1",
                },
              }}
            >
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <MDBox flex={1}>
                    <MDTypography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: "1.125rem",
                        mb: 1,
                        display: "block",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {item.title}
                    </MDTypography>
                    {typeof item.amount === "object" && item.amount.type === "custom" ? (
                      <MDBox>
                        <MDBox
                          display="grid"
                          gridTemplateColumns="1fr auto 1fr"
                          alignItems="center"
                          textAlign="center"
                          mb={1}
                        >
                          <MDTypography
                            sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}
                          >
                            Actual
                          </MDTypography>
                          <MDTypography
                            sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}
                          >
                            |
                          </MDTypography>
                          <MDTypography
                            sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}
                          >
                            Achieved
                          </MDTypography>
                        </MDBox>
                        <MDBox
                          display="grid"
                          gridTemplateColumns="1fr auto 1fr"
                          alignItems="center"
                          textAlign="center"
                        >
                          <MDTypography
                            sx={{ fontSize: "1.0rem", fontWeight: 600, color: "#1e293b" }}
                          >
                            {item.title === "ACTUAL REVENUE" ? "1" : item.amount.actual}
                          </MDTypography>
                          <MDTypography
                            sx={{ fontSize: "1.0rem", fontWeight: 600, color: "#1e293b" }}
                          >
                            |
                          </MDTypography>
                          <MDTypography
                            sx={{ fontSize: "1.0rem", fontWeight: 600, color: "#1e293b" }}
                          >
                            {item.amount.achieved}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ) : (
                      <MDTypography
                        variant="h5"
                        sx={{
                          color: "#1e293b",
                          fontSize: "1.0rem",
                          fontWeight: 600,
                          lineHeight: 1.3,
                          mb: 2,
                        }}
                      >
                        {item.amount}
                      </MDTypography>
                    )}
                  </MDBox>
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="3rem"
                    height="3rem"
                    borderRadius="50%"
                    sx={{
                      background: item.gradient,
                      color: "white",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Icon sx={{ fontSize: "1.5rem" }}>{item.icon}</Icon>
                  </MDBox>
                </MDBox>

                <MDBox>
                  <MDBox
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      background: "#f1f5f9",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <MDBox
                      sx={{
                        height: "100%",
                        width: `${item.progress}%`,
                        background: item.gradient,
                        borderRadius: 3,
                        transition: "width 1.5s ease-in-out",
                        position: "relative",
                      }}
                    />
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <MDTypography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                      }}
                    >
                      Achievement Progress
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      sx={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {item.progress}%
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          ))}
        </MDBox>

        {/* Revenue Analytics Chart - Hidden on Mobile */}
        {!isMobile && (
          <MDBox
            mt={8}
            sx={{
              position: "relative",
              zIndex: 2,
            }}
          >
            <Card
              sx={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background:
                    "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #06d6a0 50%, #ef4444 75%, #f59e0b 100%)",
                  borderRadius: "4px 4px 0 0",
                  zIndex: 1,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                  zIndex: -1,
                },
              }}
            >
              <MDBox p={6}>
                <MDBox mb={4}>
                  <MDTypography
                    variant="h4"
                    sx={{
                      color: "#1e293b",
                      fontWeight: 800,
                      mb: 1,
                    }}
                  >
                    Revenue Trends & Analytics
                  </MDTypography>
                  <MDTypography
                    variant="body1"
                    sx={{
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    Advanced insights and predictive analytics dashboard
                  </MDTypography>
                </MDBox>
                <MDBox
                  sx={{
                    minHeight: "400px",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <ResponsiveRevenueChart chartData={chartData} />
                </MDBox>
              </MDBox>
            </Card>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Revenue;
