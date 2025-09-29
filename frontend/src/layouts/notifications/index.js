/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim[](https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function KanbanView() {
  const stacks = [
    "Upcoming Stay",
    "Checked-In",
    "Staying Guest",
    "Upcoming Check-Out",
    "Checked-Out",
    "Same Day Check Out",
    "No Show",
    "Unknown",
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5">Kanban View</MDTypography>
              </MDBox>
              <MDBox
                display="flex"
                overflow="auto"
                px={2}
                pb={2}
                sx={{
                  "& > *:last-child": { mr: 0 },
                }}
              >
                {stacks.map((stack) => (
                  <MDBox key={stack} minWidth={280} mr={2}>
                    <Card>
                      <MDBox p={2}>
                        <MDTypography variant="h6">{stack}</MDTypography>
                      </MDBox>
                      <MDBox px={2} pb={2}>
                        {/* Add your draggable items/cards here as needed */}
                        <Card sx={{ mb: 2 }}>
                          <MDBox p={2}>
                            <MDTypography variant="body2">Sample Item 1</MDTypography>
                          </MDBox>
                        </Card>
                        <Card>
                          <MDBox p={2}>
                            <MDTypography variant="body2">Sample Item 2</MDTypography>
                          </MDBox>
                        </Card>
                      </MDBox>
                    </Card>
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default KanbanView;
