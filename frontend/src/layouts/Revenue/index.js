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
      <div ref={(ref) => (this.chartContainer = ref)} style={{ height: "400px", width: "100%" }} />
    );
  }
}

// PropTypes validation for CanvasJSChart
CanvasJSChart.propTypes = {
  options: PropTypes.object.isRequired,
};

// Revenue Chart Component with your exact code
class RevenueChart extends Component {
  render() {
    const options = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Revenue Performance Analytics",
      },
      axisX: {
        title: "Revenue Categories",
        reversed: true,
      },
      axisY: {
        title: "Amount (Rs)",
        includeZero: true,
        labelFormatter: this.addSymbols,
      },
      data: [
        {
          type: "bar",
          dataPoints: [
            { y: 7000000, label: "Monthly Target" },
            { y: 7000000, label: "Target Revenue" },
            { y: 6300000, label: "Expected Revenue" },
            { y: 5250000, label: "Actual Revenue" },
            { y: 230000, label: "Daily Target" },
          ],
        },
      ],
    };
    return (
      <div>
        <CanvasJSChart options={options} />
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

function Revenue() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const shimmer = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  `;

  // Fetch revenue data from backend
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/revenue");
        const result = await response.json();

        if (result.success) {
          setRevenueData(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch revenue data");
        }
      } catch (err) {
        setError("Unable to connect to backend server");
        console.error("Revenue fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchRevenueData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format currency values
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 1000000) {
      return `Rs ${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `Rs ${(numValue / 1000).toFixed(0)}K`;
    }
    return `Rs ${numValue.toLocaleString()}`;
  };

  // Chart data based on backend response
  const getChartData = () => {
    // Show default values if no data yet
    return [
      {
        label: "Actual Revenue",
        value: revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 0,
        color: "#3b82f6",
      },
      {
        label: "Expected Revenue",
        value: revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 0,
        color: "#8b5cf6",
      },
      {
        label: "Target",
        value: 7000000,
        color: "#06d6a0",
      },
      { label: "Daily Target", value: 230000, color: "#ef4444" },
      { label: "Monthly Target", value: 7000000, color: "#f59e0b" },
    ];
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  // Revenue cards data based on backend response
  const getRevenueCards = () => {
    // Show default values if no data yet
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 0;
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 0;
    const totalRevenue = revenueData ? parseFloat(revenueData.totalRevenue) || 0 : 0;
    const occupancyRate = revenueData ? parseFloat(revenueData.occupancyRate) || 0 : 0;

    // Calculate sum of actual and expected revenue for target
    const targetSum = actualRevenue + expectedRevenue;

    return [
      {
        title: "ACTUAL REVENUE",
        amount: formatCurrency(actualRevenue),
        progress: Math.min((actualRevenue / 7000000) * 100, 100), // Progress against monthly target
        color: "success",
        icon: "trending_up",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      },
      {
        title: "EXPECTED REVENUE",
        amount: formatCurrency(expectedRevenue),
        progress: Math.min((expectedRevenue / 7000000) * 100, 100),
        color: "info",
        icon: "schedule",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      },
      {
        title: "TARGET",
        amount: formatCurrency(targetSum),
        progress: 100,
        color: "primary",
        icon: "flag",
        gradient: "linear-gradient(135deg, #06d6a0 0%, #059669 100%)",
      },
      {
        title: "MONTHLY TARGET",
        amount: "Rs7.0M",
        progress: Math.min((totalRevenue / 7000000) * 100, 100),
        color: "warning",
        icon: "flag",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      },
      {
        title: "DAILY TARGET",
        amount: "Rs230K",
        progress: Math.min((actualRevenue / 230000) * 100, 100),
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
              "@media (max-width: 1200px)": {
                flex: "1 1 calc(33.333% - 24px)",
              },
              "@media (max-width: 900px)": {
                flex: "1 1 calc(50% - 24px)",
              },
              "@media (max-width: 600px)": {
                flex: "1 1 100%",
              },
            },
          }}
        >
          {revenueCards.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
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
              <MDBox p={4}>
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
                      }}
                    >
                      {item.title}
                    </MDTypography>
                    <MDTypography
                      variant="h3"
                      sx={{
                        color: "#1e293b",
                        fontSize: "2rem",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        mb: 2,
                      }}
                    >
                      {item.amount}
                    </MDTypography>
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

        {/* Revenue Analytics Chart */}
        <MDBox mt={8} sx={{ position: "relative", zIndex: 2 }}>
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
                <RevenueChart />
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Revenue;
