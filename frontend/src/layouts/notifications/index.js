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

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ReservationCard({ guest }) {
  const [open, setOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [error, setError] = useState(null);

  const HOSTAWAY_API = "https://api.hostaway.com/v1/reservations";
  const HOSTAWAY_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6ImNhYzRlNzlkOWVmZTBiMmZmOTBiNzlkNTEzYzIyZTU1MDhiYWEwNWM2OGEzYzNhNzJhNTU1ZmMzNDI4OTQ1OTg2YWI0NTVjNmJjOWViZjFkIiwiaWF0IjoxNzM2MTY3ODExLjgzNTUyNCwibmJmIjoxNzM2MTY3ODExLjgzNTUyNiwiZXhwIjoyMDUxNzAwNjExLjgzNTUzMSwic3ViIjoiIiwic2NvcGVzIjpbImdlbmVyYWwiXSwic2VjcmV0SWQiOjUzOTUyfQ.Mmqfwt5R4CK5AHwNQFfe-m4PXypLLbAPtzCD7CxgjmagGa0AWfLzPM_panH9fCbYbC1ilNpQ-51KOQjRtaFT3vR6YKEJAUkUSOKjZupQTwQKf7QE8ZbLQDi0F951WCPl9uKz1nELm73V30a8rhDN-97I43FWfrGyqBgt7F8wPkE";

  const handleOpen = async () => {
    setOpen(true);
    setLoadingDetails(true);
    setError(null);

    try {
      const response = await fetch(`${HOSTAWAY_API}/${guest.reservationId}`, {
        headers: {
          Authorization: `Bearer ${HOSTAWAY_TOKEN}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch reservation details");

      const data = await response.json();
      console.log("Hostaway details:", data);

      setReservationDetails(data.result || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <MDBox p={2}>
        {/* Reservation ID at top */}
        <MDTypography variant="subtitle2" color="primary" fontWeight="bold">
          Reservation #{guest.reservationId || "N/A"}
        </MDTypography>

        {/* Guest Info */}
        <MDBox display="flex" alignItems="center" mt={1} mb={1}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <MDTypography variant="body1" fontWeight="medium">
            {guest.guestName || "N/A"}
          </MDTypography>
        </MDBox>

        {/* Apartment Status */}
        <MDBox display="flex" alignItems="center" mb={1}>
          <ApartmentIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <MDTypography variant="body2" color="textSecondary">
            {guest.aptStatus || "N/A"}
          </MDTypography>
        </MDBox>

        {/* Stay Duration */}
        <MDBox mt={1} mb={1}>
          <MDTypography variant="caption" color="textSecondary">
            Stay Duration
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            {guest.stayDuration || "N/A"}
          </MDTypography>
        </MDBox>

        {/* Check-in / Check-out */}
        <MDBox mt={1}>
          <MDBox display="flex" alignItems="center" mb={0.5}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: "success.main" }} />
            <MDTypography variant="body2">Check-In: {guest.actualCheckin || "N/A"}</MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center">
            <ExitToAppIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
            <MDTypography variant="body2">Check-Out: {guest.actualCheckout || "N/A"}</MDTypography>
          </MDBox>
        </MDBox>

        {/* Tags */}
        {guest.tags?.length > 0 && (
          <MDBox display="flex" flexWrap="wrap" mt={2}>
            {guest.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  mr: 0.5,
                  mb: 0.5,
                  bgcolor: "primary.light",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            ))}
          </MDBox>
        )}

        {/* Preview Button */}
        <MDBox mt={2} textAlign="right">
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpen}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              backgroundColor: "#ffffff",
              color: "primary.main",
              borderColor: "primary.main",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "primary.dark",
              },
              "&:focus": {
                backgroundColor: "#ffffff",
              },
              "&:active": {
                backgroundColor: "#ffffff",
              },
            }}
          >
            Preview
          </Button>
        </MDBox>
      </MDBox>
      {/* Preview Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" py={2}>
              <CircularProgress />
            </MDBox>
          ) : error ? (
            <MDTypography variant="body2" color="error">
              Error: {error}
            </MDTypography>
          ) : (
            <MDBox>
              <MDTypography variant="body2">
                <strong>Name:</strong> {reservationDetails?.guestName || guest.guestName || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>CNIC:</strong>{" "}
                {reservationDetails?.customFieldValues?.find(
                  (field) => field.customField?.name === "ID card Number/ Passport number"
                )?.value ||
                  guest.cnic ||
                  "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Unit:</strong> {reservationDetails?.listingName || guest.unit || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Type:</strong> {reservationDetails?.channelName || guest.type || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Contact:</strong> {reservationDetails?.phone || guest.contact || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Total Nights:</strong>{" "}
                {reservationDetails?.nights || guest.totalNights || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Total Amount:</strong>{" "}
                {reservationDetails?.totalPrice || guest.totalAmount || "N/A"}{" "}
                {reservationDetails?.currency || ""}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Early Check-in:</strong>{" "}
                {reservationDetails?.checkInTime
                  ? `${reservationDetails.checkInTime}:00`
                  : guest.earlyCheckin || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Price/Night:</strong>{" "}
                {reservationDetails?.financeField?.find((field) => field.name === "baseRate")
                  ?.value ||
                  guest.pricePerNight ||
                  "N/A"}{" "}
                {reservationDetails?.currency || ""}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Channel ID:</strong> {reservationDetails?.channelName || "N/A"}
              </MDTypography>
              <MDBox mt={2} />
              <MDTypography variant="body2">
                <strong>Address:</strong>{" "}
                {reservationDetails?.customFieldValues?.find(
                  (field) => field.customField?.name === "Address"
                )?.value ||
                  guest.address ||
                  "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Email:</strong> {reservationDetails?.guestEmail || guest.email || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Adults:</strong> {reservationDetails?.numberOfGuests || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Children:</strong> {reservationDetails?.children || guest.children || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Check-in Date:</strong>{" "}
                {reservationDetails?.arrivalDate || guest.checkinDate || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Check-in Time:</strong>{" "}
                {reservationDetails?.checkInTime
                  ? `${reservationDetails.checkInTime}:00`
                  : guest.checkinTime || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Check-out Date:</strong>{" "}
                {reservationDetails?.departureDate || guest.checkoutDate || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Check-out Time:</strong>{" "}
                {reservationDetails?.checkOutTime
                  ? `${reservationDetails.checkOutTime}:00`
                  : guest.checkoutTime || "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Vehicle No:</strong>{" "}
                {reservationDetails?.customFieldValues?.find(
                  (field) => field.customField?.name === "Vehicle Number"
                )?.value ||
                  guest.vehicleNo ||
                  "N/A"}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Security:</strong>{" "}
                {reservationDetails?.securityDepositFee || guest.security || "N/A"}{" "}
                {reservationDetails?.currency || ""}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Deposit:</strong>{" "}
                {reservationDetails?.financeField?.find((field) => field.name === "totalPaid")
                  ?.value ||
                  guest.deposit ||
                  "N/A"}{" "}
                {reservationDetails?.currency || ""}
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              backgroundColor: "#ffffff",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&:focus": {
                backgroundColor: "#ffffff",
              },
              "&:active": {
                backgroundColor: "#ffffff",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

// Define PropTypes for ReservationCard
ReservationCard.propTypes = {
  guest: PropTypes.shape({
    id: PropTypes.string.isRequired,
    guestName: PropTypes.string,
    reservationId: PropTypes.string,
    aptStatus: PropTypes.string,
    stayDuration: PropTypes.string,
    actualCheckin: PropTypes.string,
    actualCheckout: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    stack: PropTypes.string,
  }).isRequired,
};

function KanbanView() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Configuration
  const API_ENDPOINT = "https://teable.namuve.com/api/table/tbliOdo8ldmMO8rrYyN/record";
  const API_TOKEN = "teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=";

  const stacks = [
    "Upcoming Stay",
    "Checked In",
    "Staying Guest",
    "Upcoming Checkout",
    "Checked Out",
    "Same Day Check Out",
    "No Show",
    "Unknown",
  ];

  // Field mappings from API response
  const FIELD_MAP = {
    guestName: "Guest Name", // fldrVBpLpF2tgV0x6Ej
    reservationId: "Reservation ID", // fld86bKCKbHUjwct1kH
    aptStatus: "Apt Status", // fld1eUwsfQm1Q7Ohjbw
    stayDuration: "Stay Duration", // fld51m5EBER5vxwDZSL
    actualCheckin: "Actual Checkin", // fldTuBkzfSTgE8MamHG
    actualCheckout: "Actual Checkout", // fldjrY4P4JgPDxhQ4Tl
    tags: "Tags", // fldXAbO0T3KFSXClVcF
    stack: "Status", // fldUCJESFtQspNSVHLs
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINT}?user_field_names=true`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Debug: Log the raw API response

        if (!data.records || !Array.isArray(data.records)) {
          throw new Error("Invalid API response: 'records' is missing or not an array");
        }

        const mappedReservations = data.records.map((row) => {
          // Access fields from row.fields
          const fields = row.fields || {};

          // Parse Tags field
          let tags = [];
          const rawTags = fields[FIELD_MAP.tags];
          try {
            if (Array.isArray(rawTags)) {
              tags = rawTags;
            } else if (typeof rawTags === "string" && rawTags) {
              tags = JSON.parse(rawTags);
            } else {
              tags = [];
            }
          } catch (e) {
            console.warn(`Failed to parse tags for row ${row.id}:`, e);
            tags = [];
          }

          // Normalize Status to match stack names
          let stack = fields[FIELD_MAP.stack] || "Unknown";

          // Map fields to reservation object
          const reservation = {
            id: row.id || `fallback-${Date.now()}-${Math.random()}`,
            guestName: fields[FIELD_MAP.guestName] || "N/A",
            reservationId: fields[FIELD_MAP.reservationId] || "N/A",
            aptStatus: fields[FIELD_MAP.aptStatus] || "N/A",
            stayDuration: fields[FIELD_MAP.stayDuration] || "N/A",
            actualCheckin: fields[FIELD_MAP.actualCheckin] || "N/A",
            actualCheckout: fields[FIELD_MAP.actualCheckout] || "N/A",
            tags,
            stack: stacks.includes(stack) ? stack : "Unknown", // Ensure valid stack
          };

          return reservation;
        });

        setReservations(mappedReservations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mt={6} mb={3}>
          <MDTypography variant="h5">Loading reservations...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mt={6} mb={3}>
          <MDTypography variant="h5" color="error">
            Error: {error}
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

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
                  <MDBox key={stack} minWidth={315} mr={2}>
                    <Card
                      sx={{
                        backgroundColor: "#FAF9F6", // light gray background for the stack
                        borderRadius: "16px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      }}
                    >
                      <MDBox p={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDTypography variant="h6">{stack}</MDTypography>
                          <Chip
                            label={reservations.filter((guest) => guest.stack === stack).length}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </MDBox>
                      </MDBox>

                      <MDBox px={2} pb={2}>
                        {reservations
                          .filter((guest) => guest.stack === stack)
                          .map((guest) => (
                            <ReservationCard key={guest.id} guest={guest} />
                          ))}
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
