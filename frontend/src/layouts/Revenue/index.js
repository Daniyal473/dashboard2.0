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
    console.log("💰 Formatting value:", value);
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

              {/* Revenue Amount */}
              <MDBox
                sx={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  p: 1.5,
                  border: `1px solid ${category.color}20`,
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

function Revenue() {
  const { user, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
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
        // Fetch revenue data
        console.log("🔗 Connecting to:", API_ENDPOINTS.REVENUE);
        const revenueResponse = await fetch(API_ENDPOINTS.REVENUE);
        console.log("📡 Revenue response status:", revenueResponse.status);
        const revenueResult = await revenueResponse.json();
        console.log("📊 Revenue API Result:", revenueResult);

        // Fetch monthly target data
        console.log("🔗 Connecting to:", API_ENDPOINTS.MONTHLY_TARGET);
        const monthlyResponse = await fetch(API_ENDPOINTS.MONTHLY_TARGET);
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

  // Redirect non-admin users (Revenue is admin-only)
  if (!isAdmin()) {
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
    console.log("🔍 Backend Connection Check:");
    console.log("- revenueData exists:", !!revenueData);
    console.log("- monthlyData exists:", !!monthlyData);
    console.log("- Raw actualRevenue from backend:", revenueData?.actualRevenue);
    console.log("- Raw actualRevenue type:", typeof revenueData?.actualRevenue);

    if (!revenueData && !monthlyData) {
      console.log("❌ NO BACKEND CONNECTION AT ALL - RETURNING EMPTY");
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

    console.log("🔥 EXTRACTED REAL VALUES:");
    console.log("- Actual Revenue:", actualRevenue);
    console.log("- Expected Revenue:", expectedRevenue);
    console.log("- Monthly Achieved:", monthlyAchieved);
    console.log("- Quarterly Achieved:", quarterlyAchievedRevenue);

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
      console.log("❌ NO VALID BARS - ALL VALUES ARE NULL/ZERO");
      return [];
    }

    console.log("✅ RETURNING", validBars.length, "VALID BARS");
    return validBars;
  };

  const chartData = getChartData();
  console.log(
    "🔍 Chart Data Values:",
    chartData.map((item) => ({ label: item.label, value: item.value }))
  );
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);
  console.log("📊 Max Value:", maxValue);

  // Revenue cards data based on backend response - Updated
  const getRevenueCards = () => {
    // Dynamic target revenue from backend only
    const targetRevenue = revenueData ? parseFloat(revenueData.targetRevenue) || 583000 : 583000; // Default fallback
    const quarterlyTarget = revenueData
      ? parseFloat(revenueData.quarterlyTarget) || 70000000
      : 70000000; // Default fallback
    // API actual revenue from backend
    const actualRevenue = revenueData ? parseFloat(revenueData.actualRevenue) || 0 : 0; // Rs175K (API actual)
    // Expected revenue from backend
    const expectedRevenue = revenueData ? parseFloat(revenueData.expectedRevenue) || 0 : 0; // Rs100K (expected)
    const totalRevenue = revenueData ? parseFloat(revenueData.totalRevenue) || 0 : 0;
    const monthlyAchievedRevenue = monthlyData 
      ? monthlyData.totalMonthlyAchieved || monthlyData.monthlyAchieved || actualRevenue || 0 
      : actualRevenue || 0;
    
    // Debug logging for monthly data
    console.log("🔍 Monthly Data Debug:", {
      monthlyData,
      totalMonthlyAchieved: monthlyData?.totalMonthlyAchieved,
      monthlyAchieved: monthlyData?.monthlyAchieved,
      calculatedMonthlyAchieved: monthlyAchievedRevenue,
      actualRevenue
    });
    const monthlyTarget = monthlyData ? monthlyData.monthlyTarget || 17500000 : 17500000; // Default fallback
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

    return [
      {
        title: "ACTUAL REVENUE",
        amount: formatCurrency(actualRevenue), // API Actual Revenue: 175480.55 PKR
        progress: actualRevenueProgress, // Individual achievement progress
        color: "success",
        icon: "trending_up",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        target: formatCurrency(targetRevenue),
        description: `${actualRevenueProgress.toFixed(2)}% of daily target achieved`,
      },
      {
        title: "EXPECTED REVENUE",
        amount: formatCurrency(expectedRevenue), // Dynamic Expected Revenue from backend
        progress: expectedRevenueProgress, // Individual achievement progress
        color: "info",
        icon: "schedule",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        target: formatCurrency(targetRevenue),
        description: `${expectedRevenueProgress.toFixed(2)}% of daily target expected`,
      },
      {
        title: "TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(targetRevenue), // Dynamic target value
          achieved: formatCurrency(expectedRevenue),
        },
        progress: targetAchievementProgress, // Combined achievement progress
        color: "primary",
        icon: "flag",
        gradient: "linear-gradient(135deg, #06d6a0 0%, #059669 100%)",
        description: `${targetAchievementProgress.toFixed(2)}% of daily target completed`,
      },
      {
        title: "MONTHLY TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(monthlyTarget), // Monthly target from API
          achieved: formatCurrency(monthlyAchievedRevenue), // Monthly achieved revenue from Teable
        },
        progress: monthlyProgress,
        color: "warning",
        icon: "flag",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        description: `${monthlyProgress.toFixed(2)}% of monthly target achieved`,
      },
      {
        title: "QUARTERLY TARGET",
        amount: {
          type: "custom",
          actual: formatCurrency(quarterlyTarget), // Dynamic quarterly target value
          achieved: formatCurrency(quarterlyAchievedRevenue), // Dynamic quarterly achieved revenue from Teable
        },
        progress: quarterlyProgress,
        color: "error",
        icon: "flag",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        description: `${quarterlyProgress.toFixed(2)}% of quarterly target achieved`,
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
          <MDBox
            sx={{
              textAlign: "left",

              "@media (max-width: 768px)": {
                textAlign: "center",
              },
            }}
          >
            <MDTypography
              variant="h2"
              sx={{
                color: "#1e293b",
                fontWeight: 800,
                fontSize: "2.5rem",
                mb: 1,
                letterSpacing: "-0.025em",
                lineHeight: 1.2,

                "@media (max-width: 768px)": {
                  fontSize: "2rem",
                  mb: 1.5,
                },

                "@media (max-width: 480px)": {
                  fontSize: "1.8rem",
                },
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

                "@media (max-width: 768px)": {
                  fontSize: "1rem",
                  fontWeight: 600,
                },

                "@media (max-width: 480px)": {
                  fontSize: "0.9rem",
                },
              }}
            >
              Real-time insights and performance analytics
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Revenue Metrics Grid */}
        <MDBox
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            display: "grid",
            gap: 2,

            // Default: 3 columns for medium screens
            gridTemplateColumns: "repeat(3, 1fr)",

            // Large screens: 5 columns (all cards in one row)
            "@media (min-width: 1400px)": {
              gridTemplateColumns: "repeat(5, 1fr)",
            },

            // Medium screens: 3 columns
            "@media (max-width: 1399px) and (min-width: 900px)": {
              gridTemplateColumns: "repeat(3, 1fr)",
            },

            // Small tablets: 2 columns
            "@media (max-width: 899px) and (min-width: 600px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },

            // Mobile: 1 column
            "@media (max-width: 599px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {revenueCards.map((item, index) => (
            <Card
              key={index}
              sx={{
                height: "340px",
                minHeight: "340px",
                maxHeight: "340px",
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
                p={2.5}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  zIndex: 1,
                  minHeight: "100%",
                }}
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
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
                        }}
                      >
                        <MDTypography
                          variant="caption"
                          sx={{
                            color: "#374151",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontSize: "0.75rem",
                            display: "block",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {item.title}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        sx={{
                          width: "60px",
                          height: "3px",
                          background: item.gradient,
                          borderRadius: "1.5px",
                          mb: 3,
                          boxShadow: `0 2px 8px ${item.gradient.split("(")[1].split(",")[0]}40`,
                        }}
                      />
                    </MDBox>
                    {typeof item.amount === "object" && item.amount.type === "custom" ? (
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
                                  }}
                                >
                                  Actual
                                </MDTypography>
                                <MDTypography
                                  sx={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {item.title === "ACTUAL REVENUE"
                                    ? "Actual Revenue"
                                    : item.amount.actual}
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
                                  }}
                                >
                                  Achieved
                                </MDTypography>
                                <MDTypography
                                  sx={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    lineHeight: 1.2,
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
                                      color: "#8b5cf6",
                                      background: "#8b5cf615",
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
                            const categoryTarget = 0; // No hardcoded targets - use dynamic only
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
                    width="5rem"
                    height="5rem"
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
                        fontSize: "2.2rem",
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
                    minHeight: "120px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Progress Description */}
                  {item.description && (
                    <MDBox
                      mb={2.5}
                      sx={{ minHeight: "60px", display: "flex", alignItems: "center" }}
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
                          fontSize: "1.2rem",
                          position: "relative",
                          zIndex: 1,
                          letterSpacing: "1px",
                          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                          background: "#ffffff",
                          padding: "8px 16px",
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Revenue;
