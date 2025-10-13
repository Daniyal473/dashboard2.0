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
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// React hooks
import { useState, useEffect } from "react";

// Authentication context
import { useAuth } from "context/AuthContext";

// @mui material components
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// API Configuration
import { API_ENDPOINTS } from "config/api";

function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const { sales, tasks } = reportsLineChartData;

  // State for monthly target data
  const [monthlyData, setMonthlyData] = useState({
    totalMonthlyAchieved: 0,
    formattedTotal: "Rs0",
    monthlyTarget: 17500000,
    formattedMonthlyTarget: "Rs17.5M",
    loading: true,
  });

  // Fetch monthly target data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MONTHLY_TARGET, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log("📊 Monthly Target API Response:", result);
          if (result.success) {
            console.log("✅ Monthly Target Data:", result.data);
            setMonthlyData({
              ...result.data,
              loading: false,
            });
          } else {
            console.error("❌ Monthly Target API Error:", result.error);
          }
        } else {
          console.error("❌ Monthly Target API Failed:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        console.error("❌ Network Error - Backend may not be running on port 5000");
        setMonthlyData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchMonthlyData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchMonthlyData, 5 * 60 * 1000);
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

  // Redirect non-admin users (Dashboard is admin-only)
  if (!isAdmin()) {
    window.location.href = "/fdo-panel";
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Bookings"
                count={281}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "than lask week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Today's Users"
                count="2,300"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="trending_up"
                title="Monthly Target"
                count={monthlyData.formattedMonthlyTarget}
                percentage={{
                  color: "info",
                  amount: "",
                  label: "Target for this month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="account_balance_wallet"
                title="Monthly Achieved"
                count={monthlyData.loading ? "Loading..." : monthlyData.formattedTotal}
                percentage={{
                  color: "success",
                  amount: monthlyData.loading
                    ? ""
                    : `${Math.round(
                        (monthlyData.totalMonthlyAchieved / monthlyData.monthlyTarget) * 100
                      )}%`,
                  label: "of monthly target",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
