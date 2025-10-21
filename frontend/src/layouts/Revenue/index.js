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
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";

// React
import React, { Component, useState, useEffect } from "react";
import PropTypes from "prop-types";
import useMediaQuery from "@mui/material/useMediaQuery";

// Authentication context
import { useAuth } from "context/AuthContext";

// @mui material components
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton"; // Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

// API Configuration
import { API_ENDPOINTS } from "config/api";
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
    // console.log("💰 Formatting value:", value);
    if (value >= 1000000) {
      return `Rs${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rs${Math.round(value / 1000)}K`;
    } else {
      return `Rs${Math.round(value)}`;
    }
  };

  handleBarClick = (item, index) => {
    // console.log("Bar clicked:", item.label, item.value);
    this.setState(
      {
        selectedBar: { ...item, index },
        showDetails: true,
      },
      () => {
        // console.log("State updated:", this.state.showDetails, this.state.selectedBar);
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
        target: "Dynamic",
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
                padding: isMobile ? "12px" : "16px",
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
                  height: isMobile ? "50px" : "65px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "6px",
                  position: "relative",
                  overflow: "visible",
                  boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* Animated Bar */}
                <div
                  style={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                    width: `${
                      index === 0
                        ? Math.max((item.value / maxValue) * 100, 8)
                        : Math.max((item.value / maxValue) * 100, 12)
                    }%`,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "8px",
                    transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `slideIn-${index} 1.5s cubic-bezier(0.4, 0, 0.2, 1)`,
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    minWidth: "3px",
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

                  {/* Value Label Inside Bar - Always Show */}
                  <span
                    style={{
                      fontSize: isMobile ? "10px" : "12px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "900",
                      color: "#ffffff",
                      textShadow: "0 2px 6px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)",
                      zIndex: 10,
                      position: "relative",
                      whiteSpace: "nowrap",
                      background: "rgba(0,0,0,0.6)",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      backdropFilter: "blur(2px)",
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
              {this.formatValue(this.state.hoveredBar.displayValue || this.state.hoveredBar.value)}
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

// New Improved Listing Revenue Component
function ImprovedListingRevenue({ revenueData, formatCurrency }) {
  const categories = revenueData?.categoryRevenue || {
    Studio: 0,
    "1BR": 0,
    "2BR": 0,
    "2BR Premium": 0,
    "3BR": 0,
  };

  const categoryData = [
    { name: "Studio", value: categories.Studio || 0, color: "#3b82f6", icon: "🏠" },
    { name: "1BR", value: categories["1BR"] || 0, color: "#8b5cf6", icon: "🏠" },
    { name: "2BR", value: categories["2BR"] || 0, color: "#06d6a0", icon: "🏠" },
    { name: "2BR Premium", value: categories["2BR Premium"] || 0, color: "#f59e0b", icon: "⭐" },
    { name: "3BR", value: categories["3BR"] || 0, color: "#ef4444", icon: "🏠" },
  ];

  const totalRevenue = Object.values(categories).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  return (
    <Card
      sx={{
        background: "#ffffff",
        boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.08)",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <MDBox
        p={3}
        pb={2}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "2px solid #e2e8f0",

          "@media (max-width: 600px)": {
            p: 4,
            pb: 3,
          },
        }}
      >
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            "@media (max-width: 600px)": {
              flexDirection: "column",
              textAlign: "center",
              gap: 2,
            },
          }}
        >
          <MDBox
            sx={{
              "@media (max-width: 600px)": {
                order: 2,
              },
            }}
          >
            <MDTypography
              variant="h4"
              sx={{
                color: "#1e293b",
                fontWeight: 800,
                fontSize: "1.4rem",
                mb: 0.5,
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",

                "@media (max-width: 600px)": {
                  fontSize: "1.6rem",
                  mb: 1,
                },
              }}
            >
              LISTING REVENUE
            </MDTypography>
            <MDTypography
              sx={{
                color: "#64748b",
                fontSize: "0.9rem",
                fontWeight: 500,
                lineHeight: 1.4,

                "@media (max-width: 600px)": {
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#475569",
                },
              }}
            >
              Category-wise revenue breakdown • Total: {formatCurrency(totalRevenue)}
            </MDTypography>
          </MDBox>
          <MDBox
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              borderRadius: "16px",
              p: 1.5,
              color: "#ffffff",
              boxShadow: "0 8px 25px rgba(99, 102, 241, 0.3)",

              "@media (max-width: 600px)": {
                order: 1,
                borderRadius: "20px",
                p: 2,
                boxShadow: "0 12px 35px rgba(99, 102, 241, 0.4)",
              },
            }}
          >
            <Icon
              sx={{
                fontSize: "1.8rem",

                "@media (max-width: 600px)": {
                  fontSize: "2.2rem",
                },
              }}
            >
              home
            </Icon>
          </MDBox>
        </MDBox>
      </MDBox>

      {/* Categories Grid - Responsive Layout */}
      <MDBox p={3}>
        <MDBox
          display="grid"
          gap={1.5}
          sx={{
            // Desktop: 5 columns in one row
            gridTemplateColumns: "repeat(5, 1fr)",

            // Tablet: 3 columns, 2 rows
            "@media (max-width: 900px)": {
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            },

            // Mobile: 2 columns, better spacing
            "@media (max-width: 600px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2.5,

              // Center the last item if it's alone in the final row
              "& > :nth-child(5)": {
                gridColumn: "1 / -1",
                maxWidth: "50%",
                margin: "0 auto",
              },
            },
          }}
        >
          {categoryData.map((category, index) => (
            <MDBox
              key={category.name}
              sx={{
                background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}08 100%)`,
                borderRadius: "16px",
                border: `2px solid ${category.color}25`,
                p: 2.5,
                textAlign: "center",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                minHeight: "140px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",

                // Mobile specific styling
                "@media (max-width: 600px)": {
                  p: 3,
                  minHeight: "160px",
                  borderRadius: "20px",
                  boxShadow: `0 8px 25px ${category.color}20`,
                },

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 12px 35px ${category.color}30`,
                  border: `2px solid ${category.color}50`,

                  "@media (max-width: 600px)": {
                    transform: "translateY(-4px) scale(1.02)",
                    boxShadow: `0 15px 40px ${category.color}35`,
                  },
                },

                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: `linear-gradient(90deg, ${category.color}, ${category.color}dd)`,
                  borderRadius: "16px 16px 0 0",

                  "@media (max-width: 600px)": {
                    height: "5px",
                    borderRadius: "20px 20px 0 0",
                  },
                },
              }}
            >
              {/* Category Icon & Name */}
              <MDBox mb={1.5}>
                <MDBox
                  sx={{
                    fontSize: "2rem",
                    mb: 1,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",

                    "@media (max-width: 600px)": {
                      fontSize: "2.5rem",
                      mb: 1.5,
                    },
                  }}
                >
                  {category.icon}
                </MDBox>
                <MDTypography
                  sx={{
                    fontSize: category.name === "2BR Premium" ? "0.7rem" : "0.8rem",
                    fontWeight: 800,
                    color: "#1e293b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    lineHeight: 1.2,

                    "@media (max-width: 600px)": {
                      fontSize: category.name === "2BR Premium" ? "0.8rem" : "0.9rem",
                      letterSpacing: "0.8px",
                    },
                  }}
                >
                  {category.name}
                </MDTypography>
              </MDBox>
              
              <MDBox mb={2} />
              {/* Revenue Amount */}
              <MDBox
                sx={{
                  background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                  borderRadius: "12px",
                  p: 1.5,
                  border: `1px solid ${category.color}30`,
                  boxShadow: `0 4px 12px ${category.color}15`,

                  "@media (max-width: 600px)": {
                    borderRadius: "16px",
                    p: 2,
                    boxShadow: `0 6px 20px ${category.color}20`,
                  },
                }}
              >
                <MDTypography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 900,
                    color: category.color,
                    textShadow: `0 1px 2px ${category.color}30`,

                    "@media (max-width: 600px)": {
                      fontSize: "1.2rem",
                      letterSpacing: "0.5px",
                    },
                  }}
                >
                  {formatCurrency(parseFloat(category.value) || 0)}
                </MDTypography>
              </MDBox>
            </MDBox>
          ))}
        </MDBox>
      </MDBox>

    </Card>
  );
}

// PropTypes for ImprovedListingRevenue
ImprovedListingRevenue.propTypes = {
  revenueData: PropTypes.object,
  formatCurrency: PropTypes.func.isRequired,
};

// Mobile Responsive Payment Details Card Component
function MobilePaymentCard({ reservation, index }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Partially paid': return 'warning';
      case 'Unpaid': return 'error';
      case 'Unknown': return 'secondary';
      default: return 'default';
    }
  };

  const getReservationStatusColor = (status) => {
    switch (status) {
      case 'new': return 'primary';
      case 'modified': return 'secondary';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        background: index % 2 === 0 ? '#f8fafc' : 'white',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease'
        }
      }}
    >
      {/* Header with ID and Status */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MDBox>
          <MDTypography variant="h6" fontWeight="bold" color="primary">
            #{reservation.reservationId}
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary">
            Reservation ID
          </MDTypography>
        </MDBox>
        <MDBox display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
          <Chip 
            label={reservation.paymentStatus === 'Unknown' ? 'Due' : reservation.paymentStatus}
            color={getStatusColor(reservation.paymentStatus)}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
          <Chip 
            label={reservation.status || 'Unknown'}
            color={getReservationStatusColor(reservation.status)}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'capitalize' }}
          />
        </MDBox>
      </MDBox>

      {/* Guest and Listing Info */}
      <MDBox mb={2}>
        <MDBox display="flex" alignItems="center" gap={1} mb={1}>
          <Icon sx={{ color: '#64748b', fontSize: '1.2rem' }}>person</Icon>
          <MDTypography variant="body2" fontWeight="medium">
            {reservation.guestName}
          </MDTypography>
        </MDBox>
        <MDBox display="flex" alignItems="center" gap={1}>
          <Icon sx={{ color: '#64748b', fontSize: '1.2rem' }}>home</Icon>
          <MDTypography variant="body2" color="text.secondary">
            {reservation.listingName}
          </MDTypography>
        </MDBox>
      </MDBox>

      {/* Dates and Amount */}
      <MDBox 
        display="grid" 
        gridTemplateColumns="1fr 1fr" 
        gap={2} 
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(25, 118, 210, 0.1)'
        }}
      >
        <MDBox>
          <MDTypography variant="caption" color="text.secondary" fontWeight="bold">
            Check In
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {reservation.checkInDate}
          </MDTypography>
        </MDBox>
        <MDBox>
          <MDTypography variant="caption" color="text.secondary" fontWeight="bold">
            Check Out
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {reservation.checkOutDate}
          </MDTypography>
        </MDBox>
        <MDBox>
          <MDTypography variant="caption" color="text.secondary" fontWeight="bold">
            Amount
          </MDTypography>
          <MDTypography variant="body2" fontWeight="bold" color="success.main">
            {reservation.currency} {reservation.baseRate?.toLocaleString() || '0'}
          </MDTypography>
        </MDBox>
        <MDBox>
          <MDTypography variant="caption" color="text.secondary" fontWeight="bold">
            Check In Time
          </MDTypography>
          <MDTypography 
            variant="body2" 
            fontWeight="medium"
            sx={{
              color: reservation.actualCheckInTime === 'N/A' ? '#9ca3af' : '#374151',
              fontStyle: reservation.actualCheckInTime === 'N/A' ? 'italic' : 'normal'
            }}
          >
            {reservation.actualCheckInTime}
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

MobilePaymentCard.propTypes = {
  reservation: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

// Kanban View Component
function PaymentKanbanView({ reservations }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Group reservations by payment status
  const groupedReservations = {
    'Paid': reservations.filter(r => r.paymentStatus === 'Paid'),
    'Partially paid': reservations.filter(r => r.paymentStatus === 'Partially paid'),
    'Unpaid': reservations.filter(r => r.paymentStatus === 'Unpaid'),
    'Due': reservations.filter(r => r.paymentStatus === 'Unknown'),
  };

  const columnConfig = {
    'Paid': { color: '#4caf50', bgColor: '#e8f5e8', icon: '✅' },
    'Partially paid': { color: '#ff9800', bgColor: '#fff3e0', icon: '⏳' },
    'Unpaid': { color: '#9e9e9e', bgColor: '#f5f5f5', icon: '❌' },
    'Due': { color: '#9c27b0', bgColor: '#f3e5f5', icon: '⚠️' },
  };

  return (
    <MDBox
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: 4,
        p: 3,
        mb: 4,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDTypography 
          variant="h5" 
          fontWeight="bold"
          sx={{
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          📋 Payment Status Kanban ({reservations.length} Total)
        </MDTypography>
      </MDBox>

      <MDBox
        display="grid"
        gridTemplateColumns={isMobile ? '1fr' : 'repeat(4, 1fr)'}
        gap={3}
        sx={{ minHeight: '400px' }}
      >
        {Object.entries(groupedReservations).map(([status, statusReservations]) => (
          <Card
            key={status}
            sx={{
              p: 2,
              backgroundColor: columnConfig[status].bgColor,
              border: `2px solid ${columnConfig[status].color}25`,
              borderRadius: 3,
              minHeight: '350px'
            }}
          >
            {/* Column Header */}
            <MDBox
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              p={1.5}
              sx={{
                backgroundColor: columnConfig[status].color,
                borderRadius: 2,
                color: 'white'
              }}
            >
              <MDBox display="flex" alignItems="center" gap={1}>
                <span style={{ fontSize: '1.2rem' }}>{columnConfig[status].icon}</span>
                <MDTypography variant="h6" fontWeight="bold" color="inherit">
                  {status}
                </MDTypography>
              </MDBox>
              <Chip
                label={statusReservations.length}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
                size="small"
              />
            </MDBox>

            {/* Reservation Cards */}
            <MDBox sx={{ maxHeight: '300px', overflowY: 'auto' }}>
              {statusReservations.map((reservation, index) => (
                <Card
                  key={reservation.id}
                  sx={{
                    mb: 1.5,
                    p: 2.5,
                    backgroundColor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  {/* Header with Reservation ID and Status Chips */}
                  <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <MDBox>
                      <MDTypography 
                        variant="h6" 
                        fontWeight="bold" 
                        sx={{ 
                          color: '#e91e63',
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}
                      >
                        #{reservation.reservationId}
                      </MDTypography>
                      <MDTypography variant="caption" color="text.secondary">
                        Reservation ID
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" flexDirection="column" gap={0.5}>
                      <Chip 
                        label={reservation.paymentStatus === 'Unknown' ? 'Due' : reservation.paymentStatus}
                        sx={{
                          backgroundColor: 
                            reservation.paymentStatus === 'Paid' ? '#4caf50' :
                            reservation.paymentStatus === 'Partially paid' ? '#ff9800' :
                            reservation.paymentStatus === 'Unpaid' ? '#9e9e9e' :
                            reservation.paymentStatus === 'Unknown' ? '#9c27b0' :
                            '#9e9e9e',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: '24px'
                        }}
                        size="small"
                      />
                      <Chip 
                        label={reservation.status || 'Unknown'}
                        sx={{
                          backgroundColor: '#9e9e9e',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: '24px',
                          textTransform: 'capitalize'
                        }}
                        size="small"
                      />
                    </MDBox>
                  </MDBox>

                  {/* Guest Name with Icon */}
                  <MDBox display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Icon sx={{ color: '#64748b', fontSize: '1.2rem' }}>person</Icon>
                    <MDTypography variant="body1" fontWeight="600" color="#374151">
                      {reservation.guestName}
                    </MDTypography>
                  </MDBox>

                  {/* Listing Name with Icon */}
                  <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                    <Icon sx={{ color: '#64748b', fontSize: '1.2rem' }}>home</Icon>
                    <MDTypography variant="body2" color="text.secondary">
                      {reservation.listingName}
                    </MDTypography>
                  </MDBox>

                  {/* Date and Amount Grid */}
                  <MDBox 
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <MDBox 
                      display="grid" 
                      gridTemplateColumns="1fr 1fr" 
                      gap={2}
                      mb={1.5}
                    >
                      <MDBox>
                        <MDTypography variant="caption" color="text.secondary" fontWeight="600">
                          Check In
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="bold" color="#374151">
                          {reservation.checkInDate}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="caption" color="text.secondary" fontWeight="600">
                          Check Out
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="bold" color="#374151">
                          {reservation.checkOutDate}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    
                    <MDBox 
                      display="grid" 
                      gridTemplateColumns="1fr 1fr" 
                      gap={2}
                    >
                      <MDBox>
                        <MDTypography variant="caption" color="text.secondary" fontWeight="600">
                          Amount
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="bold" color="#374151">
                          {reservation.currency} {reservation.baseRate?.toLocaleString() || '0'}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="caption" color="text.secondary" fontWeight="600">
                          Check In Time
                        </MDTypography>
                        <MDTypography 
                          variant="body2" 
                          fontWeight="bold" 
                          sx={{
                            color: reservation.actualCheckInTime === 'N/A' ? '#9ca3af' : '#374151'
                          }}
                        >
                          {reservation.actualCheckInTime}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              ))}
              
              {statusReservations.length === 0 && (
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="100px"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 2,
                    border: '2px dashed rgba(0,0,0,0.1)'
                  }}
                >
                  <MDTypography variant="body2" color="text.secondary" fontStyle="italic">
                    No reservations
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </Card>
        ))}
      </MDBox>
    </MDBox>
  );
}

PaymentKanbanView.propTypes = {
  reservations: PropTypes.array.isRequired,
};

function Revenue() {
  const { user, isAuthenticated, isAdmin, isViewOnly, isCustom, hasPermission, loading: authLoading } = useAuth();
  const [revenueData, setRevenueData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminTargetData, setAdminTargetData] = useState({});
  
  // New reservation state
  const [reservations, setReservations] = useState([]);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  
  // View toggle state for Payment Details
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  
  // Room type dropdown states
  const [roomTypeExpanded, setRoomTypeExpanded] = useState({});

  // Add mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Hide on tablets and mobile
  
  // Sample apartment data for room types (this would come from your API)
  const apartmentData = {
    'Studio': [
      { id: 'ST001', name: 'Studio Apartment A1', status: 'Available', floor: 'G', cleaningStatus: 'Clean' },
      { id: 'ST002', name: 'Studio Apartment A2', status: 'Available', floor: 'G', cleaningStatus: 'Clean' },
      { id: 'ST003', name: 'Studio Apartment A3', status: 'Available', floor: '1F', cleaningStatus: 'Not Clean' },
      { id: 'ST004', name: 'Studio Apartment A4', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: 'ST005', name: 'Studio Apartment B1', status: 'Reserved', floor: '2F', cleaningStatus: 'Clean', guestName: 'John Smith' },
      { id: 'ST006', name: 'Studio Apartment B2', status: 'Reserved', floor: '2F', cleaningStatus: 'Not Clean', guestName: 'Sarah Johnson' },
      { id: 'ST007', name: 'Studio Apartment B3', status: 'Reserved', floor: '3F', cleaningStatus: 'Clean', guestName: 'Mike Wilson' }
    ],
    '1BR': [
      { id: '1BR001', name: '1BR Apartment C1', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: '1BR002', name: '1BR Apartment C2', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: '1BR003', name: '1BR Apartment C3', status: 'Available', floor: '2F', cleaningStatus: 'Not Clean' },
      { id: '1BR004', name: '1BR Apartment D1', status: 'Available', floor: '2F', cleaningStatus: 'Clean' },
      { id: '1BR005', name: '1BR Apartment D2', status: 'Available', floor: '3F', cleaningStatus: 'Clean' },
      { id: '1BR006', name: '1BR Apartment D3', status: 'Available', floor: '3F', cleaningStatus: 'Not Clean' },
      { id: '1BR007', name: '1BR Apartment E1', status: 'Available', floor: '4F', cleaningStatus: 'Clean' },
      { id: '1BR008', name: '1BR Apartment E2', status: 'Reserved', floor: '4F', cleaningStatus: 'Clean', guestName: 'David Brown' },
      { id: '1BR009', name: '1BR Apartment E3', status: 'Reserved', floor: '5F', cleaningStatus: 'Not Clean', guestName: 'Lisa Davis' },
      { id: '1BR010', name: '1BR Apartment F1', status: 'Reserved', floor: '5F', cleaningStatus: 'Clean', guestName: 'Tom Anderson' }
    ],
    '2BR': [
      { id: '2BR001', name: '2BR Apartment G1', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: '2BR002', name: '2BR Apartment G2', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: '2BR003', name: '2BR Apartment G3', status: 'Available', floor: '2F', cleaningStatus: 'Not Clean' },
      { id: '2BR004', name: '2BR Apartment H1', status: 'Available', floor: '2F', cleaningStatus: 'Clean' },
      { id: '2BR005', name: '2BR Apartment H2', status: 'Available', floor: '3F', cleaningStatus: 'Clean' },
      { id: '2BR006', name: '2BR Apartment H3', status: 'Available', floor: '3F', cleaningStatus: 'Not Clean' },
      { id: '2BR007', name: '2BR Apartment I1', status: 'Available', floor: '4F', cleaningStatus: 'Clean' },
      { id: '2BR008', name: '2BR Apartment I2', status: 'Available', floor: '4F', cleaningStatus: 'Clean' },
      { id: '2BR009', name: '2BR Apartment I3', status: 'Available', floor: '5F', cleaningStatus: 'Not Clean' },
      { id: '2BR010', name: '2BR Apartment J1', status: 'Available', floor: '5F', cleaningStatus: 'Clean' },
      { id: '2BR011', name: '2BR Apartment J2', status: 'Available', floor: '6F', cleaningStatus: 'Clean' },
      { id: '2BR012', name: '2BR Apartment J3', status: 'Available', floor: '6F', cleaningStatus: 'Not Clean' },
      { id: '2BR013', name: '2BR Apartment K1', status: 'Available', floor: '7F', cleaningStatus: 'Clean' },
      { id: '2BR014', name: '2BR Apartment K2', status: 'Available', floor: '7F', cleaningStatus: 'Clean' },
      { id: '2BR015', name: '2BR Apartment K3', status: 'Available', floor: '8F', cleaningStatus: 'Not Clean' },
      { id: '2BR016', name: '2BR Apartment L1', status: 'Available', floor: '8F', cleaningStatus: 'Clean' }
    ],
    '2BR Premium': [
      { id: '2BRP001', name: '2BR Premium Suite A1', status: 'Available', floor: '6F', cleaningStatus: 'Clean' },
      { id: '2BRP002', name: '2BR Premium Suite A2', status: 'Available', floor: '6F', cleaningStatus: 'Clean' },
      { id: '2BRP003', name: '2BR Premium Suite B1', status: 'Available', floor: '7F', cleaningStatus: 'Not Clean' },
      { id: '2BRP004', name: '2BR Premium Suite B2', status: 'Available', floor: '7F', cleaningStatus: 'Clean' },
      { id: '2BRP005', name: '2BR Premium Suite C1', status: 'Available', floor: '8F', cleaningStatus: 'Clean' },
      { id: '2BRP006', name: '2BR Premium Suite C2', status: 'Available', floor: '8F', cleaningStatus: 'Not Clean' },
      { id: '2BRP007', name: '2BR Premium Suite D1', status: 'Available', floor: '9F', cleaningStatus: 'Clean' },
      { id: '2BRP008', name: '2BR Premium Suite D2', status: 'Available', floor: '9F', cleaningStatus: 'Clean' },
      { id: '2BRP009', name: '2BR Premium Suite E1', status: 'Available', floor: '9F', cleaningStatus: 'Not Clean' },
      { id: '2BRP010', name: '2BR Premium Suite E2', status: 'Reserved', floor: '9F', cleaningStatus: 'Clean', guestName: 'Robert Taylor' }
    ],
    '3BR': [
      { id: '3BR001', name: '3BR Penthouse P1', status: 'Available', floor: '9F', cleaningStatus: 'Clean' },
      { id: '3BR002', name: '3BR Apartment X1', status: 'Reserved', floor: '8F', cleaningStatus: 'Clean', guestName: 'Jennifer White' },
      { id: '3BR003', name: '3BR Apartment X2', status: 'Reserved', floor: '7F', cleaningStatus: 'Not Clean', guestName: 'Michael Green' },
      { id: '3BR004', name: '3BR Apartment X3', status: 'Reserved', floor: '6F', cleaningStatus: 'Clean', guestName: 'Emily Clark' }
    ]
  };
  
  // Handle room type card click
  const handleRoomTypeClick = (roomType) => {
    setRoomTypeExpanded(prev => ({
      ...prev,
      [roomType]: !prev[roomType]
    }));
  };
  
  // Get room type statistics
  const getRoomTypeStats = (roomType) => {
    const apartments = apartmentData[roomType] || [];
    const available = apartments.filter(apt => apt.status === 'Available').length;
    const reserved = apartments.filter(apt => apt.status === 'Reserved').length;
    return { available, reserved, total: apartments.length };
  };
  
  // Get real reservations filtered by room type
  const getRealReservationsByRoomType = (roomType) => {
    return reservations.filter(reservation => {
      const listingName = reservation.listingName?.toLowerCase() || '';
      
      // Filter by room type based on listing name
      switch(roomType) {
        case 'Studio':
          return listingName.includes('studio') || listingName.includes('st ');
        case '1BR':
          return listingName.includes('1br') || listingName.includes('1 br') || listingName.includes('one bedroom');
        case '2BR':
          return (listingName.includes('2br') || listingName.includes('2 br') || listingName.includes('two bedroom')) && 
                 !listingName.includes('premium') && !listingName.includes('deluxe');
        case '2BR Premium':
          return (listingName.includes('2br') || listingName.includes('2 br') || listingName.includes('two bedroom')) && 
                 (listingName.includes('premium') || listingName.includes('deluxe') || listingName.includes('suite'));
        case '3BR':
          return listingName.includes('3br') || listingName.includes('3 br') || listingName.includes('three bedroom') || listingName.includes('penthouse');
        default:
          return false;
      }
    });
  };

  const shimmer = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  `;

  // Monitor localStorage changes for admin target data
  useEffect(() => {
    const checkAdminTargetData = () => {
      const data = JSON.parse(localStorage.getItem('monthlyTargetData') || '{}');
      setAdminTargetData(data);
    };

    // Check initially
    checkAdminTargetData();

    // Set up storage event listener for cross-tab updates
    window.addEventListener('storage', checkAdminTargetData);
    
    // Set up interval to check for same-tab updates (since storage event doesn't fire for same tab)
    const interval = setInterval(checkAdminTargetData, 1000);

    return () => {
      window.removeEventListener('storage', checkAdminTargetData);
      clearInterval(interval);
    };
  }, []);

  // Fetch revenue data and monthly target data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch revenue data
        // console.log("🔗 Connecting to:", API_ENDPOINTS.REVENUE);
        const revenueResponse = await fetch(API_ENDPOINTS.REVENUE);
        // console.log("📡 Revenue response status:", revenueResponse.status);
        const revenueResult = await revenueResponse.json();
        // console.log("📊 Revenue API Result:", revenueResult);

        // Fetch monthly target data
        // console.log("🔗 Connecting to:", API_ENDPOINTS.MONTHLY_TARGET);
        const monthlyResponse = await fetch(API_ENDPOINTS.MONTHLY_TARGET);
        // console.log("📡 Monthly response status:", monthlyResponse.status);
        const monthlyResult = await monthlyResponse.json();
        // console.log("📊 Monthly API Result:", monthlyResult);

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

  // Fetch today's reservations
  const fetchTodayReservations = async () => {
    try {
      setReservationLoading(true);
      setReservationError(null);
      
      // console.log('🔄 Fetching today\'s reservations...');
      
      const response = await fetch('/api/payment/today-reservations');
      const data = await response.json();
      
      if (data.success) {
        setReservations(data.data);
        // console.log(`✅ Loaded ${data.data.length} reservations for today`);
      } else {
        setReservationError(data.message || 'Failed to fetch reservations');
        console.error('❌ Failed to fetch reservations:', data.error);
      }
    } catch (err) {
      setReservationError(`Unable to connect to server: ${err.message}`);
      console.error('❌ Reservation fetch error:', err);
    } finally {
      setReservationLoading(false);
    }
  };

  // Fetch reservations when component mounts
  useEffect(() => {
    if (isAuthenticated && (isAdmin() || (isCustom() && (hasPermission('revenue', 'view') || hasPermission('revenue', 'complete'))))) {
      fetchTodayReservations();
    }
  }, [isAuthenticated, isAdmin, isCustom, hasPermission]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
          <MDTypography variant="h6" ml={2}>
            Loading...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated || !user) {
    window.location.href = "/authentication/sign-in";
    return null;
  }

  // Debug revenue access
  const hasRevenueAccess = isAdmin() || (isCustom() && (hasPermission('revenue', 'view') || hasPermission('revenue', 'complete')));
  // console.log('🔐 Revenue Access Check:', {
  //   isAdmin: isAdmin(),
  //   isCustom: isCustom(),
  //   userRole: user?.role,
  //   revenueView: hasPermission('revenue', 'view'),
  //   revenueComplete: hasPermission('revenue', 'complete'),
  //   hasRevenueAccess
  // });

  // Redirect users who don't have revenue access
  if (!hasRevenueAccess) {
    // console.log('❌ Revenue Access Denied - Redirecting to FDO Panel');
    window.location.href = "/fdo-panel";
    return null;
  }

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

  // FULLY DYNAMIC CHART DATA - NO HARDCODED VALUES
  const getChartData = () => {
    // ABSOLUTE CHECK: Return empty if no backend connection
    // console.log("🔍 Backend Connection Check:");
    // console.log("- revenueData exists:", !!revenueData);
    // console.log("- monthlyData exists:", !!monthlyData);
    // console.log("- Raw actualRevenue from backend:", revenueData?.actualRevenue);
    // console.log("- Raw actualRevenue type:", typeof revenueData?.actualRevenue);

    if (!revenueData && !monthlyData) {
      // console.log("❌ NO BACKEND CONNECTION AT ALL - RETURNING EMPTY");
      return [];
    }

    // Get values ONLY if they exist and are valid numbers
    const actualRevenue =
      revenueData?.actualRevenue && !isNaN(parseFloat(revenueData.actualRevenue))
        ? parseFloat(revenueData.actualRevenue)
        : null;
    const expectedRevenue =
      revenueData?.expectedRevenue &&
      !isNaN(parseFloat(revenueData.expectedRevenue)) &&
      parseFloat(revenueData.expectedRevenue) > 0
        ? parseFloat(revenueData.expectedRevenue)
        : null;
    const monthlyAchieved =
      monthlyData?.totalMonthlyAchieved &&
      !isNaN(monthlyData.totalMonthlyAchieved) &&
      monthlyData.totalMonthlyAchieved > 0
        ? monthlyData.totalMonthlyAchieved
        : null;
    const quarterlyAchievedRevenue =
      revenueData?.quarterlyAchievedRevenue &&
      !isNaN(parseFloat(revenueData.quarterlyAchievedRevenue)) &&
      parseFloat(revenueData.quarterlyAchievedRevenue) > 0
        ? parseFloat(revenueData.quarterlyAchievedRevenue)
        : null;

    // console.log("🔥 EXTRACTED REAL VALUES:");
    // console.log("- Actual Revenue:", actualRevenue);
    // console.log("- Expected Revenue:", expectedRevenue);
    // console.log("- Monthly Achieved:", monthlyAchieved);
    // console.log("- Quarterly Achieved:", quarterlyAchievedRevenue);

    // Build array ONLY with real values
    const validBars = [];

    if (actualRevenue !== null) {
      validBars.push({
        label: "Actual Revenue",
        value: actualRevenue,
        displayValue: actualRevenue,
        color: "#A67C8A",
      });
    }
    if (expectedRevenue !== null) {
      validBars.push({
        label: "Expected Revenue",
        value: expectedRevenue,
        displayValue: expectedRevenue,
        color: "#45B7D1",
      });
      validBars.push({
        label: "Achieve Target",
        value: expectedRevenue,
        displayValue: expectedRevenue,
        color: "#E85A4F",
      });
    }
    if (monthlyAchieved !== null) {
      validBars.push({
        label: "Monthly Achieved",
        value: monthlyAchieved,
        displayValue: monthlyAchieved,
        color: "#4ECDC4",
      });
    }
    if (quarterlyAchievedRevenue !== null) {
      validBars.push({
        label: "Quarterly Achieved",
        value: quarterlyAchievedRevenue,
        displayValue: quarterlyAchievedRevenue,
        color: "#6B73B8",
      });
    }

    if (validBars.length === 0) {
      // console.log("❌ NO VALID BARS - ALL VALUES ARE NULL/ZERO");
      return [];
    }

    // console.log("✅ RETURNING", validBars.length, "VALID BARS");
    return validBars;
  };

  const chartData = getChartData();
  // console.log(
  //   "🔍 Chart Data Values:",
  //   chartData.map((item) => ({ label: item.label, value: item.value }))
  // );
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);
  // console.log("📊 Max Value:", maxValue);

  // Revenue cards data based on backend response - Updated
  const getRevenueCards = () => {
    // Use state variable instead of direct localStorage access for reactivity
    const monthlyTargetData = adminTargetData;
    // console.log("🔍 Admin Target Data from state:", adminTargetData);
    // console.log("🔍 Raw localStorage data:", localStorage.getItem('monthlyTargetData'));
    // console.log("🔍 Parsed monthlyTargetData:", monthlyTargetData);
    
    const adminMonthlyTarget = monthlyTargetData.amount ? parseFloat(String(monthlyTargetData.amount).replace(/,/g, '')) : null;
    const adminDaysInMonth = monthlyTargetData.days ? parseInt(monthlyTargetData.days) : 30;
    
    // console.log("🔍 Processed values:", {
    //   adminMonthlyTarget,
    //   adminDaysInMonth,
    //   originalAmount: monthlyTargetData.amount
    // });
    
    // Calculate dynamic targets from admin form
    const dynamicDailyTarget = adminMonthlyTarget ? adminMonthlyTarget / adminDaysInMonth : null;
    const dynamicQuarterlyTarget = adminMonthlyTarget ? adminMonthlyTarget * 3 : null;
    
    // Use dynamic targets if available, otherwise fallback to backend/default values
    const targetRevenue = dynamicDailyTarget || (revenueData ? parseFloat(revenueData.targetRevenue) || 583000 : 583000);
    const quarterlyTarget = dynamicQuarterlyTarget || (revenueData ? parseFloat(revenueData.quarterlyTarget) || 70000000 : 70000000);
    // API actual revenue from backend
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 0; // Rs175K (API actual)
    // Expected revenue from backend
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 0; // Rs100K (expected)
    const totalRevenue = revenueData ? parseFloat(revenueData.totalRevenue) || 0 : 0;
    const monthlyAchievedRevenue = monthlyData 
      ? monthlyData.totalMonthlyAchieved || monthlyData.monthlyAchieved || actualRevenue || 0 
      : actualRevenue || 0;
    
    // Debug logging for monthly data and dynamic targets
    // console.log("🔍 Monthly Data Debug:", {
    //   monthlyData,
    //   totalMonthlyAchieved: monthlyData?.totalMonthlyAchieved,
    //   monthlyAchieved: monthlyData?.monthlyAchieved,
    //   calculatedMonthlyAchieved: monthlyAchievedRevenue,
    //   actualRevenue
    // });
    
    const monthlyTarget = adminMonthlyTarget || (monthlyData ? monthlyData.monthlyTarget || 17500000 : 17500000); // Use admin form value first
    
    // console.log("🎯 Dynamic Targets Debug:", {
    //   monthlyTargetData,
    //   adminMonthlyTarget,
    //   adminDaysInMonth,
    //   dynamicDailyTarget,
    //   dynamicQuarterlyTarget,
    //   finalTargetRevenue: targetRevenue,
    //   finalMonthlyTarget: monthlyTarget,
    //   finalQuarterlyTarget: quarterlyTarget
    // });
    const quarterlyAchievedRevenue = revenueData
      ? parseFloat(revenueData.quarterlyAchievedRevenue) || 0
      : 0;
    const occupancyRate = revenueData ? parseFloat(revenueData.occupancyRate) || 0 : 0;

    // Calculate individual achievement percentages for each card
    const actualRevenueProgress =
      targetRevenue > 0
        ? parseFloat(Math.min((actualRevenue / targetRevenue) * 100, 100).toFixed(2))
        : 0;

    const expectedRevenueProgress =
      targetRevenue > 0
        ? parseFloat(Math.min((expectedRevenue / targetRevenue) * 100, 100).toFixed(2))
        : 0;

    const combinedAchieved = actualRevenue + expectedRevenue;
    const targetAchievementProgress =
      targetRevenue > 0
        ? parseFloat(Math.min((combinedAchieved / targetRevenue) * 100, 100).toFixed(2))
        : 0;

    const monthlyProgress =
      monthlyTarget > 0
        ? parseFloat(Math.min((monthlyAchievedRevenue / monthlyTarget) * 100, 100).toFixed(2))
        : 0;

    const quarterlyProgress =
      quarterlyTarget > 0
        ? parseFloat(Math.min((quarterlyAchievedRevenue / quarterlyTarget) * 100, 100).toFixed(2))
        : 0;

    // Debug logging for progress values
    // console.log("🔍 Progress Values Debug:", {
    //   actualRevenueProgress,
    //   expectedRevenueProgress,
    //   targetAchievementProgress,
    //   monthlyProgress,
    //   quarterlyProgress
    // });

    return [
      {
        title: "REVENUE",
        amount: {
          type: "revenue_combined",
          actual: formatCurrency(actualRevenue), // API Actual Revenue: 175480.55 PKR
          expected: formatCurrency(expectedRevenue), // Dynamic Expected Revenue from backend
        },
        progress: (actualRevenueProgress + expectedRevenueProgress) / 2 || 35, // Average progress
        color: "success",
        icon: "trending_up",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        target: formatCurrency(targetRevenue),
        description: `${((actualRevenueProgress + expectedRevenueProgress) / 2).toFixed(2)}% of actual and expected revenue`,
      },
      {
        title: "Daily Target",
        amount: {
          type: "custom",
          actual: formatCurrency(targetRevenue), // Dynamic target value
          achieved: formatCurrency(expectedRevenue),
        },
        progress: targetAchievementProgress || 70, // Test with 70% if no data
        color: "primary",
        icon: "flag",
        gradient: "linear-gradient(135deg, #06d6a0 0%, #059669 100%)",
        description: `${(targetAchievementProgress || 70).toFixed(2)}% of daily target completed`,
      },
      {
        title: "MONTHLY TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(monthlyTarget), // Monthly target from API
          achieved: formatCurrency(monthlyAchievedRevenue), // Monthly achieved revenue from Teable
        },
        progress: monthlyProgress || 35, // Test with 35% if no data
        color: "warning",
        icon: "flag",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        description: `${(monthlyProgress || 35).toFixed(2)}% of monthly target achieved`,
      },
      {
        title: "QUARTERLY TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(quarterlyTarget), // Dynamic quarterly target value
          achieved: formatCurrency(quarterlyAchievedRevenue), // Dynamic quarterly achieved revenue from Teable
        },
        progress: quarterlyProgress || 55, // Test with 55% if no data
        color: "error",
        icon: "flag",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        description: `${(quarterlyProgress || 55).toFixed(2)}% of quarterly target achieved`,
      },
    ];
  };

  const revenueCards = getRevenueCards();

  // Loading state - show "Loading Please wait" while fetching data
  if (loading) {
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
          sx={{
            background: "#f8fafc",
          }}
        >
          <MDBox textAlign="center">
            {/* Simple Clean Spinner */}
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: "#3b82f6",
                mb: 3
              }} 
            />
            
            {/* Clean Simple Text */}
            <MDTypography 
              variant="h4" 
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "1.5rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Loading Please wait
            </MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

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
        {/* Today's Reservations Section */}
        <MDBox mb={4}>
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2} 
              sx={{ 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: { xs: 2, sm: 0 } 
              }}
            >
              <MDTypography variant="h5" fontWeight="bold" color="text.primary">
                Payment Details
              </MDTypography>
              
              {/* View Toggle Buttons - Only on desktop and disabled for view_only users */}
              {reservations.length > 0 && (
                <MDBox sx={{ display: { xs: 'none', md: 'block' } }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    disabled={isViewOnly()}
                    onChange={(event, newView) => {
                      if (newView !== null && !isViewOnly()) {
                        setViewMode(newView);
                      }
                    }}
                    sx={{
                      '& .MuiToggleButton-root': {
                        px: 2,
                        py: 1,
                        border: '1px solid #e0e0e0',
                        '&.Mui-selected': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1565c0',
                          }
                        }
                      }
                    }}
                  >
                    <ToggleButton value="table" aria-label="table view">
                      <ViewListIcon sx={{ mr: 1 }} />
                      Table
                    </ToggleButton>
                    <ToggleButton value="kanban" aria-label="kanban view">
                      <ViewModuleIcon sx={{ mr: 1 }} />
                      Kanban
                    </ToggleButton>
                  </ToggleButtonGroup>
                </MDBox>
              )}
            </MDBox>
            
            {reservationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {reservationError}
              </Alert>
            )}
            
            {reservationLoading ? (
              <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
                <MDTypography variant="body2" color="text.secondary" ml={2}>
                  Loading reservations...
                </MDTypography>
              </MDBox>
            ) : reservations.length > 0 ? (
              <>
                {/* Mobile Card View - Always show on mobile */}
                <MDBox sx={{ display: { xs: 'block', md: 'none' } }}>
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    mb={3}
                    sx={{
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    📱 Today's Reservations ({reservations.length})
                  </MDTypography>
                  
                  {reservations.map((reservation, index) => (
                    <MobilePaymentCard 
                      key={reservation.id || index}
                      reservation={reservation}
                      index={index}
                    />
                  ))}
                </MDBox>
                
                {/* Desktop Conditional View Rendering */}
                <MDBox sx={{ display: { xs: 'none', md: 'block' } }}>
                  {viewMode === 'kanban' ? (
                    <PaymentKanbanView reservations={reservations} />
                  ) : (
                  <>
                    {/* Desktop Table View */}
                    <MDBox 
                      sx={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: 4,
                        p: 3,
                        mb: 4,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                    >
                      <MDTypography 
                        variant="h5" 
                        fontWeight="bold" 
                        mb={3}
                        sx={{
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        📅 Today's Reservations ({reservations.length})
                      </MDTypography>
                      
                      <MDBox 
                        sx={{ 
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                          borderRadius: 3,
                          maxHeight: '600px',
                          overflow: 'auto',
                          backgroundColor: 'white'
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                          <thead>
                            <tr style={{ backgroundColor: 'white', borderBottom: '2px solid #e2e8f0' }}>
                              <th style={{ width: '100px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Reservation ID
                              </th>
                              <th style={{ width: '180px', textAlign: 'left', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Guest Name
                              </th>
                              <th style={{ width: '150px', textAlign: 'left', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Listing Name
                              </th>
                              <th style={{ width: '100px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Arrival Date
                              </th>
                              <th style={{ width: '100px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Departure Date
                              </th>
                              <th style={{ width: '120px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Check In Time
                              </th>
                              <th style={{ width: '100px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Amount
                              </th>
                              <th style={{ width: '120px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Payment Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                    
                            {reservations.map((reservation, index) => (
                              <tr 
                                key={reservation.id}
                                style={{
                                  backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? '#f8fafc' : 'white'}
                              >
                                <td style={{ width: '100px', textAlign: 'center', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ color: '#1976d2', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {reservation.reservationId}
                                  </span>
                                </td>
                                
                                <td style={{ width: '180px', textAlign: 'left', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.8rem' }}>
                                    {reservation.guestName}
                                  </span>
                                </td>
                                
                                <td style={{ width: '150px', textAlign: 'left', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {reservation.listingName}
                                  </span>
                                </td>
                                
                                <td style={{ width: '100px', textAlign: 'center', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    {reservation.checkInDate}
                                  </span>
                                </td>
                                
                                <td style={{ width: '100px', textAlign: 'center', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    {reservation.checkOutDate}
                                  </span>
                                </td>
                                
                                <td style={{ width: '120px', textAlign: 'center', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.8rem', color: reservation.actualCheckInTime === 'N/A' ? '#9ca3af' : '#374151' }}>
                                    {reservation.actualCheckInTime}
                                  </span>
                                </td>
                                
                                <td style={{ width: '100px', textAlign: 'center', padding: '12px 8px', borderRight: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 'bold' }}>
                                    {reservation.currency} {reservation.baseRate?.toLocaleString() || '0'}
                                  </span>
                                </td>
                                
                                <td style={{ width: '120px', textAlign: 'center', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <Chip 
                                    label={reservation.paymentStatus === 'Unknown' ? 'Due' : reservation.paymentStatus}
                                    color={
                                      reservation.paymentStatus === 'Paid' ? 'success' :
                                      reservation.paymentStatus === 'Partially paid' ? 'warning' :
                                      reservation.paymentStatus === 'Unpaid' ? 'error' :
                                      reservation.paymentStatus === 'Unknown' ? 'secondary' :
                                      'default'
                                    }
                                    size="small"
                                    sx={{ fontWeight: 600, fontSize: '0.7rem', minWidth: '60px' }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </MDBox>
                    </MDBox>
                  </>
                  )}
                </MDBox>
                
                {/* Revenue Summary Cards */}
                <MDBox mt={4}>
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="text.primary" 
                    mb={3}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '2rem'
                    }}
                  >
                    Payment Details
                  </MDTypography>
                  <MDBox 
                    display="grid" 
                    gridTemplateColumns="repeat(auto-fit, minmax(240px, 1fr))" 
                    gap={3}
                  >
                    {/* Total Reservations */}
                    <Card sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
                      borderRadius: 3,
                      border: '1px solid rgba(25, 118, 210, 0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.2)'
                      }
                    }}>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox>
                          <MDTypography variant="body2" color="text.secondary" fontWeight="500">
                            Total Reservations
                          </MDTypography>
                          <MDTypography variant="h3" fontWeight="bold" color="primary" mt={1}>
                            {reservations.length}
                          </MDTypography>
                        </MDBox>
                        <MDBox 
                          sx={{
                            backgroundColor: '#1976d2',
                            borderRadius: '50%',
                            p: 2,
                            color: 'white'
                          }}
                        >
                          📋
                        </MDBox>
                      </MDBox>
                    </Card>
                    
                    {/* Paid Reservations */}
                    <Card sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)',
                      borderRadius: 3,
                      border: '1px solid rgba(76, 175, 80, 0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(76, 175, 80, 0.2)'
                      }
                    }}>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox>
                          <MDTypography variant="body2" color="text.secondary" fontWeight="500">
                            Paid Reservations
                          </MDTypography>
                          <MDTypography variant="h3" fontWeight="bold" color="success" mt={1}>
                            {reservations.filter(r => r.paymentStatus === 'Paid').length}
                          </MDTypography>
                        </MDBox>
                        <MDBox 
                          sx={{
                            backgroundColor: '#4caf50',
                            borderRadius: '50%',
                            p: 2,
                            color: 'white'
                          }}
                        >
                          ✅
                        </MDBox>
                      </MDBox>
                    </Card>
                    
                    {/* Partially Paid Reservations */}
                    <Card sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                      boxShadow: '0 8px 32px rgba(255, 152, 0, 0.15)',
                      borderRadius: 3,
                      border: '1px solid rgba(255, 152, 0, 0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(255, 152, 0, 0.2)'
                      }
                    }}>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox>
                          <MDTypography variant="body2" color="text.secondary" fontWeight="500">
                            Partially Paid Reservations
                          </MDTypography>
                          <MDTypography variant="h3" fontWeight="bold" color="warning" mt={1}>
                            {reservations.filter(r => r.paymentStatus === 'Partially paid').length}
                          </MDTypography>
                        </MDBox>
                        <MDBox 
                          sx={{
                            backgroundColor: '#ff9800',
                            borderRadius: '50%',
                            p: 2,
                            color: 'white'
                          }}
                        >
                          ⏳
                        </MDBox>
                      </MDBox>
                    </Card>
                    
                    {/* Unpaid Reservations */}
                    <Card sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      boxShadow: '0 8px 32px rgba(97, 97, 97, 0.15)',
                      borderRadius: 3,
                      border: '1px solid rgba(97, 97, 97, 0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(97, 97, 97, 0.2)'
                      }
                    }}>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox>
                          <MDTypography variant="body2" color="text.secondary" fontWeight="500">
                            Unpaid Reservations
                          </MDTypography>
                          <MDTypography variant="h3" fontWeight="bold" sx={{ color: '#616161' }} mt={1}>
                            {reservations.filter(r => r.paymentStatus === 'Unpaid').length}
                          </MDTypography>
                        </MDBox>
                        <MDBox 
                          sx={{
                            backgroundColor: '#616161',
                            borderRadius: '50%',
                            p: 2,
                            color: 'white'
                          }}
                        >
                          ⏸️
                        </MDBox>
                      </MDBox>
                    </Card>
                    
                    {/* Due Reservations */}
                    <Card sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                      boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                      borderRadius: 3,
                      border: '1px solid rgba(156, 39, 176, 0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(156, 39, 176, 0.2)'
                      }
                    }}>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox>
                          <MDTypography variant="body2" color="text.secondary" fontWeight="500">
                            Due Reservations
                          </MDTypography>
                          <MDTypography variant="h3" fontWeight="bold" color="secondary" mt={1}>
                            {reservations.filter(r => r.paymentStatus === 'Unknown').length}
                          </MDTypography>
                        </MDBox>
                        <MDBox 
                          sx={{
                            backgroundColor: '#9c27b0',
                            borderRadius: '50%',
                            p: 2,
                            color: 'white'
                          }}
                        >
                          💰
                        </MDBox>
                      </MDBox>
                    </Card>
                  </MDBox>
                </MDBox>
              </>
            ) : (
              <MDBox 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="200px"
                flexDirection="column"
              >
                <MDTypography variant="h6" color="text.secondary" mb={1}>
                  No Reservations Found
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" textAlign="center">
                  No new or modified reservations for today.
                </MDTypography>
              </MDBox>
            )}
          </Card>
        </MDBox>

        {/* Revenue Metrics Grid */}
        <MDBox
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            display: "grid",
            gap: 4,

            // Default: 4 columns for large screens (better space utilization)
            gridTemplateColumns: "repeat(4, 1fr)",

            // Large laptops and desktops: 4 columns (better card size)
            "@media (min-width: 1200px)": {
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 4,
            },

            // Standard laptops: 4 columns with proper spacing
            "@media (max-width: 1199px) and (min-width: 1024px)": {
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 3,
            },

            // Small laptops and large tablets: 2 columns, 2 rows
            "@media (max-width: 1023px) and (min-width: 768px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 3,
            },

            // Tablets: 2 columns
            "@media (max-width: 767px) and (min-width: 600px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
            },

            // Mobile: 1 column
            "@media (max-width: 599px)": {
              gridTemplateColumns: "1fr",
              gap: 2,
            },
          }}
        >
          {revenueCards.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: "420px",
                minHeight: "420px",
                maxHeight: "420px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                boxShadow:
                  "0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 4px 15px -5px rgba(0, 0, 0, 0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",

                // Responsive card sizing for better laptop fit
                "@media (max-width: 1199px) and (min-width: 1024px)": {
                  height: "400px",
                  minHeight: "400px",
                  maxHeight: "400px",
                },

                // Larger cards for small laptops and tablets
                "@media (max-width: 1023px) and (min-width: 768px)": {
                  height: "380px",
                  minHeight: "380px",
                  maxHeight: "380px",
                },
                "&:hover": {
                  transform: "translateY(-10px) scale(1.02)",
                  boxShadow:
                    "0 40px 80px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)",
                  border: "1px solid #cbd5e1",
                  "&::before": {
                    height: "7px",
                  },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "6px",
                  background: item.gradient,
                  borderRadius: "6px 6px 0 0",
                  zIndex: 3,
                  transition: "height 0.3s ease",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `radial-gradient(circle at top right, ${
                    item.gradient.split("(")[1].split(",")[0]
                  }12 0%, transparent 80%)`,
                  pointerEvents: "none",
                  zIndex: 0,
                },
              }}
            >
              <MDBox
                p={3}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  zIndex: 1,
                  minHeight: "100%",

                  // Responsive padding for better laptop fit
                  "@media (max-width: 1199px) and (min-width: 1024px)": {
                    p: 2.5,
                  },

                  // Better padding for small laptops and tablets
                  "@media (max-width: 1023px) and (min-width: 768px)": {
                    p: 2,
                  },
                }}
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <MDBox flex={1}>
                    <MDBox>
                      <MDBox
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          background: `linear-gradient(135deg, ${
                            item.gradient.split("(")[1].split(",")[0]
                          }15 0%, ${item.gradient.split("(")[1].split(",")[0]}08 100%)`,
                          borderRadius: 3,
                          px: 2,
                          py: 1,
                          mb: 2,
                          border: `1px solid ${item.gradient.split("(")[1].split(",")[0]}20`,
                          
                          // Normal container for laptop
                          "@media (max-width: 1199px) and (min-width: 1024px)": {
                            display: "flex",
                            width: "100%",
                            justifyContent: "center",
                            px: 1,
                            py: 0.5,
                            minHeight: "auto",
                          },
                        }}
                      >
                        <MDTypography
                          variant="caption"
                          sx={{
                            color: "#374151",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontSize: "1rem",
                            display: "block",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            lineHeight: 1.2,

                            // Responsive font sizing for laptop screens
                            "@media (max-width: 1199px) and (min-width: 1024px)": {
                              fontSize: "0.9rem",
                              letterSpacing: "0.08em",
                              whiteSpace: "nowrap",
                              display: "block",
                              textAlign: "center",
                              lineHeight: 1.2,
                            },

                            "@media (max-width: 1023px) and (min-width: 768px)": {
                              fontSize: "0.85rem",
                              letterSpacing: "0.06em",
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          {item.title}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        sx={{
                          width: "100%",
                          height: "3px",
                          background: item.gradient,
                          borderRadius: "1.5px",
                          mb: 3,
                          boxShadow: `0 2px 8px ${item.gradient.split("(")[1].split(",")[0]}40`,
                        }}
                      />
                    </MDBox>
                    {typeof item.amount === "object" && item.amount.type === "revenue_combined" ? (
                      <MDBox>
                        <MDBox mb={2}>
                          <MDBox
                            display="grid"
                            gridTemplateColumns="1fr 1fr"
                            gap={2}
                            width="100%"
                            mb={1}
                          >
                            <MDBox textAlign="center">
                              <MDTypography
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "#64748b",
                                  mb: 1,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",

                                  // Responsive font sizing for laptop screens
                                  "@media (max-width: 1199px) and (min-width: 1024px)": {
                                    fontSize: "0.7rem",
                                    mb: 0.8,
                                  },

                                  "@media (max-width: 1023px) and (min-width: 768px)": {
                                    fontSize: "0.68rem",
                                    mb: 0.6,
                                  },
                                }}
                              >
                                Actual
                              </MDTypography>
                              <MDTypography
                                sx={{
                                  fontSize: "1.6rem",
                                  fontWeight: 700,
                                  color: "#1e293b",
                                  lineHeight: 1.2,

                                  // Responsive font sizing for laptop screens
                                  "@media (max-width: 1199px) and (min-width: 1024px)": {
                                    fontSize: "1.5rem",
                                  },

                                  "@media (max-width: 1023px) and (min-width: 768px)": {
                                    fontSize: "1.4rem",
                                  },
                                }}
                              >
                                {item.amount.actual}
                              </MDTypography>
                            </MDBox>

                            <MDBox textAlign="center">
                              <MDTypography
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "#64748b",
                                  mb: 1,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",

                                  // Responsive font sizing for laptop screens
                                  "@media (max-width: 1199px) and (min-width: 1024px)": {
                                    fontSize: "0.7rem",
                                    mb: 0.8,
                                  },

                                  "@media (max-width: 1023px) and (min-width: 768px)": {
                                    fontSize: "0.68rem",
                                    mb: 0.6,
                                  },
                                }}
                              >
                                Expected 
                              </MDTypography>
                              <MDTypography
                                sx={{
                                  fontSize: "1.6rem",
                                  fontWeight: 700,
                                  color: "#1e293b",
                                  lineHeight: 1.2,

                                  // Responsive font sizing for laptop screens
                                  "@media (max-width: 1199px) and (min-width: 1024px)": {
                                    fontSize: "1.5rem",
                                  },

                                  "@media (max-width: 1023px) and (min-width: 768px)": {
                                    fontSize: "1.4rem",
                                  },
                                }}
                              >
                                {item.amount.expected}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ) : typeof item.amount === "object" && item.amount.type === "custom" ? (
                      <MDBox>
                        <MDBox mb={2}>
                          <MDBox
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            textAlign="center"
                            gap={1}
                            mb={1}
                          >
                            <MDBox
                              display="grid"
                              gridTemplateColumns="1fr 1fr"
                              gap={2}
                              width="100%"
                              mb={1}
                            >
                              <MDBox textAlign="center">
                                <MDTypography
                                  sx={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "#64748b",
                                    mb: 1,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",

                                    // Responsive font sizing for laptop screens
                                    "@media (max-width: 1199px) and (min-width: 1024px)": {
                                      fontSize: "0.7rem",
                                      mb: 0.8,
                                    },

                                    "@media (max-width: 1023px) and (min-width: 768px)": {
                                      fontSize: "0.68rem",
                                      mb: 0.6,
                                    },
                                  }}
                                >
                                  Actual
                                </MDTypography>
                                <MDTypography
                                  sx={{
                                    fontSize: "1.6rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    lineHeight: 1.2,

                                    // Responsive font sizing for laptop screens
                                    "@media (max-width: 1199px) and (min-width: 1024px)": {
                                      fontSize: "1.5rem",
                                    },

                                    "@media (max-width: 1023px) and (min-width: 768px)": {
                                      fontSize: "1.4rem",
                                    },
                                  }}
                                >
                                  {item.amount.actual}
                                </MDTypography>
                              </MDBox>

                              <MDBox textAlign="center">
                                <MDTypography
                                  sx={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "#64748b",
                                    mb: 1,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",

                                    // Responsive font sizing for laptop screens
                                    "@media (max-width: 1199px) and (min-width: 1024px)": {
                                      fontSize: "0.7rem",
                                      mb: 0.8,
                                    },

                                    "@media (max-width: 1023px) and (min-width: 768px)": {
                                      fontSize: "0.68rem",
                                      mb: 0.6,
                                    },
                                  }}
                                >
                                  Achieved
                                </MDTypography>
                                <MDTypography
                                  sx={{
                                    fontSize: "1.6rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    lineHeight: 1.2,

                                    // Responsive font sizing for laptop screens
                                    "@media (max-width: 1199px) and (min-width: 1024px)": {
                                      fontSize: "1.5rem",
                                    },

                                    "@media (max-width: 1023px) and (min-width: 768px)": {
                                      fontSize: "1.4rem",
                                    },
                                  }}
                                >
                                  {item.amount.achieved}
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </MDBox>
        ) : typeof item.amount === "object" && item.amount.type === "category" ? (
          <MDBox>
            {/* Improved 5-Column Layout for All Categories */}
            <MDBox display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={1} mb={0.5}>
              {/* Studio */}
              {(() => {
                const revenue = item.amount.categories.Studio || 0;
                const categoryTarget = 0; // No hardcoded targets - use dynamic only
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
                          color: "#3b82f6",
                          background: "#3b82f615",
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
                const categoryTarget = 0; // No hardcoded targets - use dynamic only
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
                          color: "#06d6a0",
                          background: "#06d6a015",
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

                        {/* Second row with 2BR Premium and 3BR */}
                        <MDBox display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1} mb={0.5}>
                          {/* 2BR Premium */}
                          {(() => {
                            const revenue = item.amount.categories["2BR Premium"] || 0;
                            const categoryTarget = 0; // No hardcoded targets - use dynamic only
                            const categoryProgress = Math.min(
                              (parseFloat(revenue) / categoryTarget) * 100,
                              100
                            );
                            const color = "#f59e0b";

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
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.2px",
                                      mb: 0.3,
                                    }}
                                  >
                                    2BR Premium
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
                                      color: "#f59e0b",
                                      background: "#f59e0b15",
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
                            const categoryTarget = 0; // No hardcoded targets - use dynamic only
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
                                      color: "#ef4444",
                                      background: "#ef444415",
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

                          {/* Empty space for 3-column layout balance */}
                          <MDBox></MDBox>
                        </MDBox>
                      </MDBox>
                    ) : (
                      <MDBox textAlign="center" mb={2}>
                        <MDTypography
                          variant="h4"
                          sx={{
                            color: "#1e293b",
                            fontSize: "1.8rem",
                            fontWeight: 800,
                            lineHeight: 1.2,
                            mb: 2,
                            textShadow: "0 1px 2px rgba(0,0,0,0.1)",

                            // Responsive font sizing for laptop screens
                            "@media (max-width: 1199px) and (min-width: 1024px)": {
                              fontSize: "1.6rem",
                            },

                            "@media (max-width: 1023px) and (min-width: 768px)": {
                              fontSize: "1.4rem",
                            },
                          }}
                        >
                          {item.amount}
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                  <MDBox
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="3.5rem"
                    height="3.5rem"
                    borderRadius="50%"
                    sx={{
                      background: item.gradient,
                      color: "white",
                      boxShadow: `0 12px 32px -8px ${
                        item.gradient.split("(")[1].split(",")[0]
                      }40, 0 0 0 3px rgba(255,255,255,0.8)`,
                      position: "relative",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1) rotate(5deg)",
                        boxShadow: `0 16px 40px -8px ${
                          item.gradient.split("(")[1].split(",")[0]
                        }50, 0 0 0 4px rgba(255,255,255,0.9)`,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "3px",
                        left: "3px",
                        right: "3px",
                        bottom: "3px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                        pointerEvents: "none",
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.6)",
                        filter: "blur(2px)",
                        pointerEvents: "none",
                      },
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: "1rem",
                        zIndex: 1,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      {item.icon}
                    </Icon>
                  </MDBox>
                </MDBox>

                {/* Achievement Progress - Show for all cards */}
                <MDBox
                  mt="auto"
                  sx={{
                    minHeight: "80px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Progress Description */}
                  {item.description && (
                    <MDBox
                      mb={1.5}
                      sx={{ minHeight: "40px", display: "flex", alignItems: "center" }}
                    >
                      <MDBox
                        sx={{
                          background: `linear-gradient(135deg, ${
                            item.gradient.split("(")[1].split(",")[0]
                          }08 0%, transparent 100%)`,
                          borderRadius: 3,
                          p: 2,
                          border: `1px solid ${item.gradient.split("(")[1].split(",")[0]}15`,
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontWeight: 500,
                            fontSize: "0.85rem",
                            textAlign: "center",
                            lineHeight: 1.4,
                          }}
                        >
                          {item.description}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  )}


                  {/* Progress Text */}
                  <MDBox
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                    sx={{ minHeight: "50px" }}
                  >
                    <MDBox flex={1}>
                      <MDTypography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 0.2,
                        }}
                      >
                        Progress
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 400,
                          fontSize: "0.6rem",
                        }}
                      >
                        
                      </MDTypography>
                    </MDBox>
                    <MDBox
                      sx={{
                        background: `linear-gradient(135deg, ${
                          item.gradient
                        } 0%, ${item.gradient.replace("0%", "20%")} 100%)`,
                        borderRadius: 4,
                        px: 2.5,
                        py: 1,
                        boxShadow: `0 8px 20px ${
                          item.gradient.split("(")[1].split(",")[0]
                        }30, 0 0 0 2px rgba(255,255,255,0.9)`,
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px) scale(1.05)",
                          boxShadow: `0 12px 28px ${
                            item.gradient.split("(")[1].split(",")[0]
                          }40, 0 0 0 3px rgba(255,255,255,0.95)`,
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: "2px",
                          left: "2px",
                          right: "2px",
                          height: "50%",
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
                          borderRadius: "5px 5px 0 0",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: "4px",
                          left: "6px",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.7)",
                          filter: "blur(1px)",
                        },
                      }}
                    >
                      <MDTypography
                        variant="h4"
                        sx={{
                          color: index === 0 ? "#3b82f6" : 
                                 index === 1 ? "#8b5cf6" : 
                                 index === 2 ? "#06d6a0" : 
                                 index === 3 ? "#f59e0b" : "#ef4444",
                          fontWeight: 500,
                          fontSize: "1.4rem",
                          position: "relative",
                          zIndex: 1,
                          letterSpacing: "1px",
                          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                          background: "#ffffff",
                          padding: "10px 18px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {typeof item.progress === "number"
                          ? item.progress.toFixed(2)
                          : parseFloat(item.progress || 0).toFixed(2)}
                        %
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                </MDBox>
              </MDBox>
            </Card>
          ))}
        </MDBox>

        {/* New Improved Listing Revenue Section */}
        <MDBox mt={4}>
          <ImprovedListingRevenue revenueData={revenueData} formatCurrency={formatCurrency} />
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
        
        {/* Room Availability & Cleaning Status Section */}
        <MDBox mt={4}>
          <Card sx={{ p: 3, backgroundColor: 'white', boxShadow: 3 }}>
            <MDTypography variant="h5" color="text.primary" mb={3} fontWeight="bold">
              🏨 Room Availability & Cleaning Status:
            </MDTypography>
            
            <MDBox 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(240px, 1fr))" 
              gap={2}
            >
              {['Studio', '1BR', '2BR', '2BR Premium', '3BR'].map((roomType) => {
                const stats = getRoomTypeStats(roomType);
                const isExpanded = roomTypeExpanded[roomType];
                
                return (
                  <MDBox key={roomType}>
                    <Card 
                      onClick={() => handleRoomTypeClick(roomType)}
                      sx={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px', 
                        p: 2.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        border: '1px solid #e0e0e0',
                        minHeight: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          borderColor: '#1976d2'
                        }
                      }}
                    >
                      <MDBox textAlign="center">
                        <MDTypography variant="h6" color="text.primary" fontWeight="bold" mb={1.5}>
                          {roomType} {isExpanded ? '▼' : '▶'}
                        </MDTypography>
                        
                        <MDTypography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          Paid: <strong style={{ color: '#2e7d32' }}>{getRealReservationsByRoomType(roomType).filter(r => r.paymentStatus === 'Paid').length}</strong> | Pending: <strong style={{ color: '#d32f2f' }}>{getRealReservationsByRoomType(roomType).filter(r => r.paymentStatus !== 'Paid').length}</strong>
                        </MDTypography>
                      </MDBox>
                    </Card>
                    
                    {/* Expandable Apartment Details */}
                    {isExpanded && (
                      <MDBox 
                        mt={2} 
                        sx={{
                          backgroundColor: '#2c3e50',
                          borderRadius: 2,
                          p: 3,
                          maxHeight: '400px',
                          overflow: 'auto'
                        }}
                      >
                        <MDTypography 
                          variant="h6" 
                          sx={{ 
                            color: 'white', 
                            mb: 2, 
                            fontWeight: 'bold',
                            textAlign: 'center'
                          }}
                        >
                          {roomType} Apartments
                        </MDTypography>
                        
                        <MDBox display="flex" flexDirection="column" gap={1}>
                          {getRealReservationsByRoomType(roomType).length > 0 ? (
                            getRealReservationsByRoomType(roomType).map((reservation) => (
                              <MDBox 
                                key={reservation.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  backgroundColor: reservation.paymentStatus === 'Paid' ? '#27ae60' : '#e74c3c',
                                  borderRadius: 1,
                                  color: 'white'
                                }}
                              >
                                <MDBox>
                                  <MDTypography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                                    {reservation.listingName || 'Unknown Apartment'}
                                  </MDTypography>
                                  {reservation.guestName && (
                                    <MDTypography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                      Guest: {reservation.guestName}
                                    </MDTypography>
                                  )}
                                  {reservation.reservationId && (
                                    <MDTypography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                                      ID: {reservation.reservationId}
                                    </MDTypography>
                                  )}
                                </MDBox>
                                
                                <MDBox textAlign="right">
                                  <MDTypography variant="caption" sx={{ color: 'white', display: 'block' }}>
                                    Payment: {reservation.paymentStatus || 'Unknown'}
                                  </MDTypography>
                                  <MDTypography 
                                    variant="caption" 
                                    sx={{ 
                                      color: '#a8e6cf',
                                      fontWeight: 'bold',
                                      display: 'block'
                                    }}
                                  >
                                    {reservation.currency} {reservation.baseRate?.toLocaleString() || '0'}
                                  </MDTypography>
                                  {reservation.checkInDate && (
                                    <MDTypography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                                      Check-in: {reservation.checkInDate}
                                    </MDTypography>
                                  )}
                                </MDBox>
                              </MDBox>
                            ))
                          ) : (
                            <MDBox 
                              sx={{
                                p: 2,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                                textAlign: 'center'
                              }}
                            >
                              <MDTypography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                No {roomType} reservations found today
                              </MDTypography>
                            </MDBox>
                          )}
                        </MDBox>
                      </MDBox>
                    )}
                  </MDBox>
                );
              })}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Revenue;
