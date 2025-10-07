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

// Custom Horizontal Bar Chart Component
class RevenueChartComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedBar: null,
      showDetails: false,
      hoveredBar: null,
      showTooltip: false,
      tooltipPosition: { x: 0, y: 0 },
    };
  }

  formatValue = (value) => {
    if (value >= 1000000) {
      return `Rs${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rs${Math.round(value / 1000)}K`;
    } else {
      return `Rs${Math.round(value)}`;
    }
  };

  handleBarClick = (item, index) => {
    console.log("Bar clicked:", item.label, item.value);
    this.setState(
      {
        selectedBar: { ...item, index },
        showDetails: true,
      },
      () => {
        console.log("State updated:", this.state.showDetails, this.state.selectedBar);
      }
    );
  };

  closeDetails = () => {
    this.setState({
      selectedBar: null,
      showDetails: false,
    });
  };

  handleBarHover = (item, index, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { isMobile } = this.props;

    this.setState({
      hoveredBar: { ...item, index },
      showTooltip: true,
      tooltipPosition: {
        x: rect.left + rect.width / 2,
        y: isMobile ? rect.top - 10 : rect.top - 10,
      },
    });
  };

  handleBarLeave = () => {
    this.setState({
      hoveredBar: null,
      showTooltip: false,
    });
  };

  getBarDetails = (item) => {
    const details = {
      "Actual Revenue": {
        description: "Current actual revenue generated from all sources",
        breakdown: ["Property bookings", "Service charges", "Additional fees"],
        trend: "+12.5% from last month",
        target: "Rs 583K",
      },
      "Expected Revenue": {
        description: "Projected revenue based on current bookings and trends",
        breakdown: ["Confirmed bookings", "Pending confirmations", "Estimated walk-ins"],
        trend: "+8.3% from last month",
        target: "Rs 219K",
      },
      "Achieve Target": {
        description: "Combined achievement towards daily revenue target",
        breakdown: ["Actual + Expected revenue", "Target completion rate", "Performance metrics"],
        trend: "64.28% target achieved",
        target: "Rs 583K",
      },
      "Monthly Achieved": {
        description: "Total revenue achieved for the current month",
        breakdown: ["Daily revenue accumulation", "Monthly performance", "Growth metrics"],
        trend: "+15.2% from last month",
        target: "Rs 17.5M",
      },
      "Quarterly Achieved": {
        description: "Total revenue achieved for the current quarter",
        breakdown: ["Q1 performance", "Quarterly targets", "Year-over-year growth"],
        trend: "+22.1% from last quarter",
        target: "Rs 70M",
      },
    };
    return details[item.label] || {};
  };

  render() {
    const { chartData, isMobile, isSmallMobile, isTablet } = this.props;
    const maxValue = Math.max(...chartData.map((item) => item.value), 1);

    return (
      <div
        style={{
          width: "100%",
          padding: isMobile ? "16px" : "24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Chart Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: isMobile ? "24px" : "32px",
            paddingBottom: isMobile ? "12px" : "16px",
            borderBottom: "2px solid #f1f5f9",
          }}
        >
          <h3
            style={{
              fontSize: isSmallMobile ? "16px" : isMobile ? "18px" : isTablet ? "20px" : "22px",
              fontFamily: "Inter, sans-serif",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {isMobile ? "Revenue Analytics" : "Revenue Performance Analytics"}
          </h3>
          <p
            style={{
              fontSize: isMobile ? "11px" : "13px",
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              margin: "4px 0 0 0",
              fontWeight: "400",
            }}
          >
            Real-time revenue performance metrics
          </p>
        </div>

        {/* Custom Horizontal Bar Chart */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "16px" : "20px",
          }}
        >
          {chartData.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "12px" : "16px",
                padding: isMobile ? "8px" : "10px",
                borderRadius: "8px",
                backgroundColor: "#fafbfc",
                border: "1px solid #f1f5f9",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => this.handleBarClick(item, index)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateX(2px)";
                this.handleBarHover(item, index, e);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fafbfc";
                e.currentTarget.style.borderColor = "#f1f5f9";
                e.currentTarget.style.transform = "translateX(0px)";
                this.handleBarLeave();
              }}
            >
              {/* Category Label */}
              <div
                style={{
                  minWidth: isMobile ? "90px" : "130px",
                  fontSize: isMobile ? "11px" : "13px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "600",
                  color: "#374151",
                  textAlign: "right",
                  lineHeight: "1.3",
                }}
              >
                {item.label}
              </div>

              {/* Bar Container */}
              <div
                style={{
                  flex: 1,
                  height: isMobile ? "28px" : "36px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "6px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* Animated Bar */}
                <div
                  style={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                    width: `${(item.value / maxValue) * 100}%`,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "12px",
                    transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `slideIn-${index} 1.5s cubic-bezier(0.4, 0, 0.2, 1)`,
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                    position: "relative",
                  }}
                >
                  {/* Shine Effect */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)",
                      borderRadius: "6px 6px 0 0",
                    }}
                  />

                  {/* Value Label Inside Bar */}
                  <span
                    style={{
                      fontSize: isMobile ? "10px" : "12px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "700",
                      color: "#ffffff",
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      zIndex: 1,
                      position: "relative",
                    }}
                  >
                    {this.formatValue(item.value)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* X-axis Label */}
        <div
          style={{
            textAlign: "center",
            marginTop: isMobile ? "20px" : "24px",
            paddingTop: isMobile ? "12px" : "16px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? "11px" : "13px",
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              fontWeight: "500",
              letterSpacing: "0.025em",
            }}
          >
            {!isMobile && "Amount (Rs)"}
          </span>
        </div>

        {/* Hover Tooltip */}
        {this.state.showTooltip && this.state.hoveredBar && (
          <div
            style={{
              position: "fixed",
              left: `${this.state.tooltipPosition.x}px`,
              top: `${this.state.tooltipPosition.y - 70}px`,
              backgroundColor: "#1e293b",
              color: "#ffffff",
              padding: "10px 14px",
              borderRadius: "6px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              zIndex: 10000,
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                marginBottom: "4px",
                color: this.state.hoveredBar.color,
              }}
            >
              {this.state.hoveredBar.label}
            </div>
            <div style={{ fontWeight: "700", fontSize: "14px" }}>
              {this.formatValue(this.state.hoveredBar.value)}
            </div>
          </div>
        )}

        {/* Details Modal */}
        {this.state.showDetails && this.state.selectedBar && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={this.closeDetails}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: isMobile ? "20px" : "30px",
                maxWidth: isMobile ? "90%" : "500px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={this.closeDetails}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "5px",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f1f5f9";
                  e.target.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#64748b";
                }}
              >
                ×
              </button>

              {/* Modal Header */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: this.state.selectedBar.color,
                      borderRadius: "4px",
                    }}
                  />
                  <h3
                    style={{
                      fontSize: isMobile ? "18px" : "20px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    {this.state.selectedBar.label}
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "24px" : "28px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "800",
                    color: this.state.selectedBar.color,
                    marginBottom: "8px",
                  }}
                >
                  {this.formatValue(this.state.selectedBar.value)}
                </div>
              </div>

              {/* Modal Content */}
              {(() => {
                const details = this.getBarDetails(this.state.selectedBar);
                return (
                  <div>
                    <p
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        fontFamily: "Inter, sans-serif",
                        color: "#64748b",
                        lineHeight: "1.5",
                        marginBottom: "20px",
                      }}
                    >
                      {details.description}
                    </p>

                    {/* Breakdown */}
                    <div style={{ marginBottom: "20px" }}>
                      <h4
                        style={{
                          fontSize: isMobile ? "14px" : "16px",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: "600",
                          color: "#374151",
                          marginBottom: "10px",
                        }}
                      >
                        Breakdown:
                      </h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {details.breakdown?.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: isMobile ? "13px" : "14px",
                              fontFamily: "Inter, sans-serif",
                              color: "#64748b",
                              marginBottom: "6px",
                              paddingLeft: "16px",
                              position: "relative",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: "0",
                                color: this.state.selectedBar.color,
                                fontWeight: "bold",
                              }}
                            >
                              •
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: "120px",
                          padding: "12px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobile ? "11px" : "12px",
                            fontFamily: "Inter, sans-serif",
                            color: "#64748b",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          Trend
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? "13px" : "14px",
                            fontFamily: "Inter, sans-serif",
                            color: "#059669",
                            fontWeight: "600",
                          }}
                        >
                          {details.trend}
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          minWidth: "120px",
                          padding: "12px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobile ? "11px" : "12px",
                            fontFamily: "Inter, sans-serif",
                            color: "#64748b",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          Target
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? "13px" : "14px",
                            fontFamily: "Inter, sans-serif",
                            color: "#374151",
                            fontWeight: "600",
                          }}
                        >
                          {details.target}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Enhanced Animation Keyframes */}
        <style>
          {`
            ${chartData
              .map(
                (item, index) => `
              @keyframes slideIn-${index} {
                0% {
                  width: 0%;
                  opacity: 0.7;
                }
                50% {
                  opacity: 0.9;
                }
                100% {
                  width: ${(item.value / maxValue) * 100}%;
                  opacity: 1;
                }
              }
            `
              )
              .join("")}
          `}
        </style>
      </div>
    );
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
    const targetRevenue = 583000; // Rs583K (fixed daily target - base for quarterly calculation)
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 175480.55;
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 100406.13;
    const monthlyTarget = monthlyData ? monthlyData.monthlyTarget || 17500000 : 17500000; // Rs17.5M
    const monthlyAchieved = monthlyData ? monthlyData.totalMonthlyAchieved || 0 : 0;

    // Get quarterly achieved revenue - same as used in the cards
    const quarterlyAchievedRevenue = revenueData
      ? parseFloat(revenueData.quarterlyAchievedRevenue) || 0
      : 0;

    // Quarterly target (70M as shown in cards)
    const quarterlyTarget = 70000000; // Rs 70M

    return [
      { label: "Actual Revenue", value: actualRevenue, color: "#A67C8A" }, // 1 Purple
      { label: "Expected Revenue", value: expectedRevenue, color: "#45B7D1" }, // 2 Blue-green
      { label: "Achieve Target", value: expectedRevenue, color: "#E85A4F" }, // 3 Red - same as expected revenue
      { label: "Monthly Achieved", value: monthlyAchieved, color: "#4ECDC4" }, // 4 Green
      { label: "Quarterly Achieved", value: quarterlyAchievedRevenue, color: "#6B73B8" }, // 5 Blue
    ];
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  // Revenue cards data based on backend response - Updated
  const getRevenueCards = () => {
    // Fixed target revenue - remains unchanged
    const targetRevenue = 583000; // Rs583K (fixed daily target)
    const quarterlyTarget = targetRevenue * 90; // Rs52.47M (90 days quarterly target)
    // API actual revenue from backend
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 0; // Rs175K (API actual)
    // Expected revenue from backend
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 0; // Rs100K (expected)
    const totalRevenue = revenueData ? parseFloat(revenueData.totalRevenue) || 0 : 0;
    const monthlyAchievedRevenue = monthlyData ? monthlyData.totalMonthlyAchieved || 0 : 0;
    const monthlyTarget = monthlyData ? monthlyData.monthlyTarget || 17500000 : 17500000;
    const quarterlyAchievedRevenue = revenueData
      ? parseFloat(revenueData.quarterlyAchievedRevenue) || 0
      : 0;
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
        amount: formatCurrency(expectedRevenue), // Dynamic Expected Revenue from backend
        progress: achievementProgress, // Same achievement progress
        color: "info",
        icon: "schedule",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      },
      {
        title: "LISTING REVENUE",
        amount: {
          type: "category",
          categories: revenueData?.categoryRevenue || { Studio: 0, "1BR": 0, "2BR": 0, "3BR": 0 },
        },
        progress: parseFloat(Math.min((expectedRevenue / targetRevenue) * 100, 100).toFixed(2)),
        color: "dark",
        icon: "home",
        gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
      },
      {
        title: "TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(targetRevenue), // Rs583K (fixed target)
          achieved: formatCurrency(expectedRevenue), // Same as Expected Revenue (dynamic)
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
        title: "QUARTERLY TARGET",
        amount: {
          type: "custom",
          actual: "Rs 70M", // Quarterly Target Actual
          achieved: formatCurrency(quarterlyAchievedRevenue), // Dynamic quarterly achieved revenue from Teable
        },
        progress: parseFloat(Math.min((quarterlyAchievedRevenue / 70000000) * 100, 100).toFixed(2)),
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
            width: "100%",

            // Default layout for all screens: 3 cards per row
            "& > *": {
              flex: "1 1 calc(33.333% - 24px)",
              minWidth: "280px",
              maxWidth: "calc(33.333% - 24px)",
            },

            // Desktop view (1920px and up): Show all 6 cards in one row
            "@media (min-width: 1920px)": {
              "& > *": {
                flex: "1 1 calc(16.666% - 24px)",
                minWidth: "280px",
                maxWidth: "calc(16.666% - 24px)",
              },
            },

            // Tablet adjustments
            "@media (max-width: 1200px)": {
              "& > *": {
                flex: "1 1 calc(50% - 24px)",
                minWidth: "300px",
                maxWidth: "calc(50% - 24px)",
              },
            },

            // Mobile adjustments
            "@media (max-width: 768px)": {
              "& > *": {
                flex: "1 1 100%",
                minWidth: "280px",
                maxWidth: "100%",
              },
            },
          }}
        >
          {revenueCards.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: "300px",
                minHeight: "300px",
                maxHeight: "300px",
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
                        <MDBox mb={2}>
                          <MDBox
                            display="grid"
                            gridTemplateColumns="1fr auto 1fr"
                            alignItems="center"
                            textAlign="center"
                            mb={1}
                          >
                            <MDTypography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#64748b",
                              }}
                            >
                              Actual
                            </MDTypography>
                            <MDTypography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#64748b",
                                mx: 2,
                              }}
                            >
                              |
                            </MDTypography>
                            <MDTypography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#64748b",
                              }}
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
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#1e293b",
                              }}
                            >
                              {item.title === "ACTUAL REVENUE"
                                ? "Actual Revenue"
                                : item.amount.actual}
                            </MDTypography>
                            <MDTypography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#64748b",
                                mx: 2,
                              }}
                            >
                              |
                            </MDTypography>
                            <MDTypography
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#1e293b",
                              }}
                            >
                              {item.amount.achieved}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ) : typeof item.amount === "object" && item.amount.type === "category" ? (
                      <MDBox>
                        {/* 2x2 Grid Layout */}
                        <MDBox display="grid" gridTemplateColumns="1fr 1fr" gap={1} mb={0.5}>
                          {/* Studio */}
                          {(() => {
                            const revenue = item.amount.categories.Studio || 0;
                            const categoryTarget = 50000;
                            const categoryProgress = Math.min(
                              (parseFloat(revenue) / categoryTarget) * 100,
                              100
                            );
                            const color = "#3b82f6";

                            return (
                              <MDBox
                                p={0.8}
                                sx={{
                                  background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                                  borderRadius: 2,
                                  border: `2px solid ${color}30`,
                                  boxShadow: `0 4px 12px ${color}20`,
                                  transition: "all 0.3s ease-in-out",
                                  position: "relative",
                                  overflow: "hidden",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 8px 20px ${color}30`,
                                    border: `2px solid ${color}50`,
                                  },
                                  "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "2px",
                                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                    borderRadius: "2px 2px 0 0",
                                  },
                                }}
                              >
                                <MDBox textAlign="center" mb={0.5}>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.3px",
                                      mb: 0.3,
                                    }}
                                  >
                                    Studio
                                  </MDTypography>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.85rem",
                                      fontWeight: 800,
                                      color: color,
                                      textShadow: `0 2px 4px ${color}30`,
                                    }}
                                  >
                                    {formatCurrency(parseFloat(revenue) || 0)}
                                  </MDTypography>
                                </MDBox>
                                <MDBox
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: "#e2e8f0",
                                    overflow: "hidden",
                                    mb: 0.5,
                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <MDBox
                                    sx={{
                                      height: "100%",
                                      width: `${categoryProgress}%`,
                                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                      borderRadius: 2,
                                      transition: "width 2s ease-in-out",
                                      boxShadow: `0 0 6px ${color}50`,
                                    }}
                                  />
                                </MDBox>
                                <MDBox textAlign="center">
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      color: color,
                                      background: `${color}15`,
                                      padding: "1px 6px",
                                      borderRadius: 1,
                                      display: "inline-block",
                                    }}
                                  >
                                    {categoryProgress.toFixed(1)}%
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            );
                          })()}

                          {/* 2BR */}
                          {(() => {
                            const revenue = item.amount.categories["2BR"] || 0;
                            const categoryTarget = 50000;
                            const categoryProgress = Math.min(
                              (parseFloat(revenue) / categoryTarget) * 100,
                              100
                            );
                            const color = "#06d6a0";

                            return (
                              <MDBox
                                p={0.8}
                                sx={{
                                  background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                                  borderRadius: 2,
                                  border: `2px solid ${color}30`,
                                  boxShadow: `0 4px 12px ${color}20`,
                                  transition: "all 0.3s ease-in-out",
                                  position: "relative",
                                  overflow: "hidden",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 8px 20px ${color}30`,
                                    border: `2px solid ${color}50`,
                                  },
                                  "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "2px",
                                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                    borderRadius: "2px 2px 0 0",
                                  },
                                }}
                              >
                                <MDBox textAlign="center" mb={0.5}>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.3px",
                                      mb: 0.3,
                                    }}
                                  >
                                    2BR
                                  </MDTypography>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.85rem",
                                      fontWeight: 800,
                                      color: color,
                                      textShadow: `0 2px 4px ${color}30`,
                                    }}
                                  >
                                    {formatCurrency(parseFloat(revenue) || 0)}
                                  </MDTypography>
                                </MDBox>
                                <MDBox
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: "#e2e8f0",
                                    overflow: "hidden",
                                    mb: 0.5,
                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <MDBox
                                    sx={{
                                      height: "100%",
                                      width: `${categoryProgress}%`,
                                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                      borderRadius: 2,
                                      transition: "width 2s ease-in-out",
                                      boxShadow: `0 0 6px ${color}50`,
                                    }}
                                  />
                                </MDBox>
                                <MDBox textAlign="center">
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      color: color,
                                      background: `${color}15`,
                                      padding: "1px 6px",
                                      borderRadius: 1,
                                      display: "inline-block",
                                    }}
                                  >
                                    {categoryProgress.toFixed(1)}%
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            );
                          })()}

                          {/* 1BR */}
                          {(() => {
                            const revenue = item.amount.categories["1BR"] || 0;
                            const categoryTarget = 50000;
                            const categoryProgress = Math.min(
                              (parseFloat(revenue) / categoryTarget) * 100,
                              100
                            );
                            const color = "#8b5cf6";

                            return (
                              <MDBox
                                p={0.8}
                                sx={{
                                  background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                                  borderRadius: 2,
                                  border: `2px solid ${color}30`,
                                  boxShadow: `0 4px 12px ${color}20`,
                                  transition: "all 0.3s ease-in-out",
                                  position: "relative",
                                  overflow: "hidden",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 8px 20px ${color}30`,
                                    border: `2px solid ${color}50`,
                                  },
                                  "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "2px",
                                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                    borderRadius: "2px 2px 0 0",
                                  },
                                }}
                              >
                                <MDBox textAlign="center" mb={0.5}>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.3px",
                                      mb: 0.3,
                                    }}
                                  >
                                    1BR
                                  </MDTypography>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.85rem",
                                      fontWeight: 800,
                                      color: color,
                                      textShadow: `0 2px 4px ${color}30`,
                                    }}
                                  >
                                    {formatCurrency(parseFloat(revenue) || 0)}
                                  </MDTypography>
                                </MDBox>
                                <MDBox
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: "#e2e8f0",
                                    overflow: "hidden",
                                    mb: 0.5,
                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <MDBox
                                    sx={{
                                      height: "100%",
                                      width: `${categoryProgress}%`,
                                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                      borderRadius: 2,
                                      transition: "width 2s ease-in-out",
                                      boxShadow: `0 0 6px ${color}50`,
                                    }}
                                  />
                                </MDBox>
                                <MDBox textAlign="center">
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      color: color,
                                      background: `${color}15`,
                                      padding: "1px 6px",
                                      borderRadius: 1,
                                      display: "inline-block",
                                    }}
                                  >
                                    {categoryProgress.toFixed(1)}%
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            );
                          })()}

                          {/* 3BR */}
                          {(() => {
                            const revenue = item.amount.categories["3BR"] || 0;
                            const categoryTarget = 50000;
                            const categoryProgress = Math.min(
                              (parseFloat(revenue) / categoryTarget) * 100,
                              100
                            );
                            const color = "#ef4444";

                            return (
                              <MDBox
                                p={0.8}
                                sx={{
                                  background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                                  borderRadius: 2,
                                  border: `2px solid ${color}30`,
                                  boxShadow: `0 4px 12px ${color}20`,
                                  transition: "all 0.3s ease-in-out",
                                  position: "relative",
                                  overflow: "hidden",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 8px 20px ${color}30`,
                                    border: `2px solid ${color}50`,
                                  },
                                  "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "2px",
                                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                    borderRadius: "2px 2px 0 0",
                                  },
                                }}
                              >
                                <MDBox textAlign="center" mb={0.5}>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.3px",
                                      mb: 0.3,
                                    }}
                                  >
                                    3BR
                                  </MDTypography>
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.85rem",
                                      fontWeight: 800,
                                      color: color,
                                      textShadow: `0 2px 4px ${color}30`,
                                    }}
                                  >
                                    {formatCurrency(parseFloat(revenue) || 0)}
                                  </MDTypography>
                                </MDBox>
                                <MDBox
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: "#e2e8f0",
                                    overflow: "hidden",
                                    mb: 0.5,
                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <MDBox
                                    sx={{
                                      height: "100%",
                                      width: `${categoryProgress}%`,
                                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                      borderRadius: 2,
                                      transition: "width 2s ease-in-out",
                                      boxShadow: `0 0 6px ${color}50`,
                                    }}
                                  />
                                </MDBox>
                                <MDBox textAlign="center">
                                  <MDTypography
                                    sx={{
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      color: color,
                                      background: `${color}15`,
                                      padding: "1px 6px",
                                      borderRadius: 1,
                                      display: "inline-block",
                                    }}
                                  >
                                    {categoryProgress.toFixed(1)}%
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            );
                          })()}
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

                {/* Achievement Progress - Show for all cards except Listing Revenue */}
                {item.title !== "LISTING REVENUE" && (
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
                )}
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
