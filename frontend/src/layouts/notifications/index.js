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
  const [reservationDetails, setReservationDetails] = useState({});
  const [error, setError] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const HOSTAWAY_API = "https://api.hostaway.com/v1/reservations";
  const HOSTAWAY_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6ImNhYzRlNzlkOWVmZTBiMmZmOTBiNzlkNTEzYzIyZTU1MDhiYWEwNWM2OGEzYzNhNzJhNTU1ZmMzNDI4OTQ1OTg2YWI0NTVjNmJjOWViZjFkIiwiaWF0IjoxNzM2MTY3ODExLjgzNTUyNCwibmJmIjoxNzM2MTY3ODExLjgzNTUyNiwiZXhwIjoyMDUxNzAwNjExLjgzNTUzMSwic3ViIjoiIiwic2NvcGVzIjpbImdlbmVyYWwiXSwic2VjcmV0SWQiOjUzOTUyfQ.Mmqfwt5R4CK5AHwNQFfe-m4PXypLLbAPtzCD7CxgjmagGa0AWfLzPM_panH9fCbYbC1ilNpQ-51KOQjRtaFT3vR6YKEJAUkUSOKjZupQTwQKf7QE8ZbLQDi0F951WCPl9uKz1nELm73V30a8rhDN-97I43FWfrGyqBgt7F8wPkE";

  const handlePrintCheckIn = async () => {
    try {
      // ✅ Fetch latest reservation from API
      const response = await fetch(`${HOSTAWAY_API}/${guest.reservationId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();
      const reservation = data.result || {};
      const guestName = reservationDetails?.guestName || guest.guestName || "N/A";

      const cnic =
        reservationDetails?.customFieldValues?.find(
          (field) => field.customField?.name === "ID card Number/ Passport number"
        )?.value || "N/A";

      const listingMapId = guest.listingName || "N/A";
      const listingType = guest.type || "N/A";
      const contact = reservationDetails?.phone || "N/A";
      const duration = reservationDetails?.nights || "N/A";
      const totalPrice = reservationDetails?.totalPrice || "N/A";
      const currencyLabel = reservationDetails?.currency || "";
      const earlyCheckIn = reservationDetails?.earlyCheckinCharges || "N/A";
      const pricePerNight = reservationDetails?.pricePerNight || "N/A";
      const channelName = reservationDetails?.channelName || "N/A";

      const address =
        reservationDetails?.customFieldValues?.find(
          (field) => field.customField?.name === "Address"
        )?.value ||
        guest.address ||
        "N/A";

      const email = reservationDetails?.guestEmail || "N/A";
      const adults = reservationDetails?.numberOfGuests || "N/A";
      const children = reservationDetails?.children || "N/A";
      const arrival = reservationDetails?.arrivalDate || "N/A";
      const checkInTime = reservationDetails?.checkInTime
        ? formatTime(reservationDetails.checkInTime)
        : guest.checkinTime
        ? formatTime(guest.checkinTime)
        : "N/A";

      const departure = reservationDetails?.departureDate || guest.checkoutDate || "N/A";

      const checkOutTime = reservationDetails?.checkOutTime
        ? formatTime(reservationDetails.checkOutTime)
        : guest.checkoutTime
        ? formatTime(guest.checkoutTime)
        : "N/A";

      const vehicleNumber =
        reservationDetails?.customFieldValues?.find(
          (field) => field.customField?.name === "Vehicle Number"
        )?.value ||
        guest.vehicleNo ||
        "N/A";

      const securityDepositFee = reservationDetails?.securityDeposit || "N/A";

      const actualCheckInTime = new Date().toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const reservationId = reservationDetails?.reservationId || "N/A";

      const formWindow = window.open("", "_blank");

      // Fill guest details dynamically
      const htmlContent = `
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <link
            rel="icon"
            href="https://i.ibb.co/vC3k9ZXv/favicon-32x32.png"
            type="image/png"
          />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
          <style>
            input[readonly] {
              pointer-events: none;
              user-select: none;
            }
            body {
              margin: 0;
              padding: 15px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 80vh;
              background-color: #f0f0f0;
            }
            .form {
              width: 150mm;
              height: 240mm;
              padding: 10px;
              margin: auto;
              background-color: white;
              border-radius: 5px;
              border: 1px solid lightblue;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .logo-img {
              display: flex;
              justify-content: center;
              height: 60px;
              margin: 10px auto;
            }
            .logo-img img {
              height: 100%;
              width: auto;
              object-fit: contain;
            }
            .heading-text h1 {
              padding-bottom: 0.5rem !important;
              font-size: 20px;
              text-align: center;
              
            }
            .form-container {
              display: flex;
              gap: 20px;
              padding: 10px;
            }
            .left-section,
            .right-section {
              flex: 1;
            }
            .form-field {
    display: flex;
    align-items: flex-start;
    margin-bottom: 15px;
    font-size: 12px;
  }

  .form-field label {
    width: 100px;
    flex-shrink: 0;
    font-weight: bold;
  }

  .form-field .field-value {
  flex: 1;
  border-bottom: 1px solid black;
  padding-bottom: 2px;
  word-break: break-word;
  font-size: 11.5px;
  min-height: 16px;
  font-family: math;
}

  /* To style readonly input fields consistently */
  .form-field input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #000000;
  font-size: 11.5px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

            .address-field input {
              width: calc(100% - 90px);
            }
            ul {
  padding-top: 2px;
  padding-bottom: 2px;
}

ul li {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 11px;
  line-height: 1;   /* slightly increased for readability */
  margin-bottom: 6px; /* adds space between list items */
}

            .space {
              padding: 8px !important;
            }
            .row .row-field {
              margin-top: 5px;
}
            .row .row-field h3 {
              font-size: 13px;
              margin: 4px 0 !important;
            }
            .row .row-field h4 {
              font-size: 12px;
              margin: 4px 0 !important;
              text-align: right;
            }
              .download-btn {
    padding: 7px 9px;
    background: transparent;
    color: black;
    border: 1px solid black;
    border-radius: 5px;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.3s, color 0.3s;
}

.download-btn:hover {
  background: black;
  color: white;
}

          </style>
        </head>
        <body>
          <div class="form">
            <div style="position: absolute; top: 5px; right: 5px; z-index: 1000;">
  <button onclick="downloadForm()" class="download-btn">
    Download
  </button>
</div>
<div style="display: flex; flex-direction: row; margin-top: 15px">
            <div class="logo-img"
            >
              <img
                src="img/booknrent-logo.png"
                alt="Booknrent Logo"
              />
            </div>
            <div class="heading-text" style="margin: 25px 40px 10px 20px">
              <h2 style="text-align: center; margin: 0; font-size: 16px;"> ${guestName}'s Check-in Form <span style="font-size: 12px; color: #666;">(${
        guest.reservationId
      })</span></h2>
              <p style="text-align: center; font-family: monospace">Actual Check-in Date / Time: ${actualCheckInTime}</p>
            </div>
            </div>
            <div class="form-container">
  <div class="left-section">
    <div class="form-field"><label>Name:</label><div class="field-value">${guestName}</div></div>
    <div class="form-field"><label>CNIC:</label><div class="field-value">${cnic}</div></div>
    <div class="form-field"><label>Unit:</label><div class="field-value">${listingMapId}</div></div>
    <div class="form-field"><label>Type:</label><div class="field-value">${listingType}</div></div>
    <div class="form-field"><label>Contact:</label><div class="field-value">${contact}</div></div>
    <div class="form-field"><label>Total Nights:</label><div class="field-value">${duration}</div></div>
<div class="form-field">
  <label>Total Amount:</label>
  <div class="field-value">
    ${totalPrice} ${currencyLabel} 
    ${currencyLabel === "USD" ? "" : "<br> ☐ Cash / ☐ IBFT / ☐ Card"}
  </div>
</div>
    <div class="form-field"><label>Early Check-in:</label><div class="field-value">${earlyCheckIn} ${currencyLabel} </div></div>
    <div class="form-field"><label>Price/Night:</label><div class="field-value">${pricePerNight}</div></div>
    <div class="form-field"><label>Channel ID:</label><div class="field-value">${channelName}</div></div>
  </div>

  <div class="right-section">
  <div class="form-field"><label>Address:</label><div class="field-value">${address}</div></div>
  <div class="form-field"><label>Email:</label><div class="field-value">${email}</div></div>
  <div class="form-field"><label>Adults:</label><div class="field-value">${adults}</div></div>
  <div class="form-field"><label>Children:</label><div class="field-value">${children}</div></div>
  <div class="form-field"><label>Check-in Date:</label><div class="field-value">${arrival}</div></div>
  <div class="form-field"><label>Check-in Time:</label><div class="field-value">${checkInTime}</div></div>
  <div class="form-field"><label>Check-out Date:</label><div class="field-value">${departure}</div></div>
  <div class="form-field"><label>Check-out Time:</label><div class="field-value">${checkOutTime}</div></div>
  <div class="form-field" ><label>Vehicle No:</label><div class="field-value" style="text-transform: uppercase;">${vehicleNumber}</div></div>
<div class="form-field">
  <label>Security Deposit:</label>
  <div class="field-value">
    ${securityDepositFee} ${currencyLabel}
    ${currencyLabel === "USD" ? "" : "<br> ☐ Cash / ☐ IBFT / ☐ Card"}
  </div>
</div>
</div>
</div>

            
            <div class="space" style="padding: 15px">
              <div class="terms">
                <h3 style="margin: -15px 0px -15px 0px; text-align: left">Terms and Conditions</h3>
                <ul>
                  <li>Original CNIC or Passport is required at the time of Check-in.</li>
                  <li>Only one car parking is allowed inside the building, Extra vehicles will be charged accordingly.</li>
                  <li>Pets are not allowed.</li>
                  <li>It is mandatory for guests to maintain a peaceful environment.</li>
                  <li>Anti-Social Behaviour and unethical activities are strictly prohibited.</li>
                  <li>Guests are requested to check out before 12:00pm on the day of check-out.</li>
                  <li><strong>Guests will bear financial liability for any damage inside the apartment and building due to their fault/negligence.</strong></li>
                  <li>Guests are requested to submit any complaints regarding the quality of services at the reception desk.</li>
                  <li>Money/Jewelry or other valuables brought to the property are at the guest's sole risk.</li>
                  </ul>
<p style="font-size: 13px; text-align: center;">
  <strong> <u>Security deposit will be refunded within 2–3 working days, after your checkout.</u></strong>
</p>

                <p style="font-family: 'Segoe UI', TTahoma, Geneva, Verdana, sans-serif;
    font-size: 13px;
    margin-bottom: 2px;
    text-align: center;">I have read and understand the terms and conditions and agree to them. <br> I will be responsible for any damage or loss to the property as per list attached.</p>
              </div>
              <div class="row">
                <div class="row-field" style="display: flex; justify-content: space-between; align-items: center; margin-top: 40px;">
                  <div class="inner-col" style="text-align: left">
                    <div style="border-bottom: 1px solid black; width:140px; margin-bottom: 5px;"></div>
                    <h3>Management Team</h3>
                  </div>
                  <div class="inner-col" style="text-align: right">
                    <div style="border-bottom: 1px solid black; width: 140px; margin-bottom: 5px; margin-left: auto;"></div>
                    <h3>Guest Signature</h3>
                  </div>
                </div>
                <div style="text-align: center; margin-top: -40px;">
  <h5 style="margin: 0; font-size: 17px;">CHECK OUT TIME 12:00 NOON</h5>
  <p style="margin: 4px 0 0; font-size: 11px;">(Late Check Out charges applicable @ Rs. 1000 per hour) <br> (*Subject to Availability)</p>
</div>


                <div style="
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 5px 0px 4px;
    margin-top: 40px;
    margin-right: -17px;
    margin-left: -17px;
    font-size: 12px;
    font-family: 'monospace';
    background-color:rgb(0, 0, 0);
    color: white;
    ">
                  <div style="text-align: left;">
                    <h4>0300-0454711</h4>
                  </div>
                  <div style="text-align: right;">
                    <h4>30-A, Block L, Gulberg 3, Lahore</h4>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <script>
            async function downloadForm() {
              const formElement = document.querySelector('.form');
              const canvas = await html2canvas(formElement, {
                scale: 2,
                logging: false,
                useCORS: true
              });
              
              const link = document.createElement('a');
              link.download = \`${guestName}'s Checkin-form (${reservationId}).png\`;
              link.href = canvas.toDataURL('image/png');
              link.click();
            }
          </script>
        </body>
      </html>
  `;

      formWindow.document.open();
      formWindow.document.write(htmlContent);
      formWindow.document.close();
    } catch (err) {
      console.error("Error preparing check-in form:", err);
      alert("Could not load reservation for printing.");
    }
  };

  // ✅ New function for Mark Check In
  const handleMarkCheckIn = async () => {
    try {
      const getResUrl = `${HOSTAWAY_API}/${guest.reservationId}`;

      const res = await fetch(getResUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${HOSTAWAY_TOKEN}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch reservation");

      const resData = await res.json();

      const existingField = resData.result?.customFieldValues?.find(
        (field) => field.customFieldId === 76281 && field.value && field.value.trim() !== ""
      );

      if (existingField) {
        console.log(`🛑 Check-in already recorded: ${existingField.value}`);
        setIsCheckedIn(true); // ✅ already checked-in
        return;
      }

      const now = new Date();
      const formattedDateTime = now.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const apiUrl = `${HOSTAWAY_API}/${guest.reservationId}?forceOverbooking=1`;

      const updateRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HOSTAWAY_TOKEN}`,
        },
        body: JSON.stringify({
          guestName: resData.result?.guestName || guest.guestName || "Guest Name",
          customFieldValues: [
            {
              customFieldId: 76281,
              value: formattedDateTime,
            },
          ],
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to update reservation");

      console.log(`✅ Check-in time saved: ${formattedDateTime}`);
      setIsCheckedIn(true); // ✅ switch button
    } catch (err) {
      console.error("❌ Error in handleMarkCheckIn:", err);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    // Ensure it's always a string
    const str = String(timeString);

    // Handle cases like "15" → treat as "15:00"
    const normalized = str.includes(":") ? str : `${str}:00`;

    const [hoursStr, minutesStr = "00"] = normalized.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours}:${minutes} ${ampm}`;
  };

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

      const result = data.result || {};

      // Extract Price/Night custom field
      let pricePerNight = "N/A";
      if (Array.isArray(result.customFieldValues)) {
        const priceField = result.customFieldValues.find(
          (field) => field.customField?.id === 63430
        );
        if (priceField) {
          pricePerNight = priceField.value || "N/A";
        }
      }

      // Extract Early Checkin Charges custom field
      let earlyCheckinCharges = "N/A";
      if (Array.isArray(result.customFieldValues)) {
        const earlyCheckinField = result.customFieldValues.find(
          (field) => field.customField?.id === 75222
        );
        if (earlyCheckinField) {
          earlyCheckinCharges = earlyCheckinField.value || "N/A";
        }
      }

      // 🔹 Extract Security Deposit (from financeField array)
      let securityDeposit = "N/A";
      if (Array.isArray(result.financeField)) {
        const securityField = result.financeField.find(
          (field) => field.alias === "Security Deposit" && field.isDeleted === 0
        );
        if (securityField) {
          securityDeposit = securityField.total ?? securityField.value ?? "N/A";
        }
      }

      setReservationDetails({ ...result, pricePerNight, earlyCheckinCharges, securityDeposit });
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

          {/* Mark Check in Button - only show in Upcoming Stay */}
          {guest.stack === "Upcoming Stay" &&
            (!isCheckedIn ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleMarkCheckIn}
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
                }}
              >
                Mark Check In
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "primary.main",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
                onClick={handlePrintCheckIn}
              >
                Print Check In
              </Button>
            ))}
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
              <Grid container spacing={2}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <MDTypography variant="body2">
                    <strong>Name:</strong>{" "}
                    {reservationDetails?.guestName || guest.guestName || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>CNIC:</strong>{" "}
                    {reservationDetails?.customFieldValues?.find(
                      (field) => field.customField?.name === "ID card Number/ Passport number"
                    )?.value || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Unit:</strong> {guest.listingName || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Type:</strong> {guest.type || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Contact:</strong> {reservationDetails?.phone || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Total Nights:</strong> {reservationDetails?.nights || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Total Amount:</strong> {reservationDetails?.totalPrice || "N/A"}{" "}
                    {reservationDetails?.currency || ""}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Early Check-in:</strong> {reservationDetails.earlyCheckinCharges}{" "}
                    {reservationDetails?.currency || ""}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Price/Night:</strong> {reservationDetails?.pricePerNight || "N/A"}{" "}
                    {reservationDetails?.currency || ""}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Channel ID:</strong> {reservationDetails?.channelName || "N/A"}
                  </MDTypography>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <MDTypography variant="body2">
                    <strong>Address:</strong>{" "}
                    {reservationDetails?.customFieldValues?.find(
                      (field) => field.customField?.name === "Address"
                    )?.value ||
                      guest.address ||
                      "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Email:</strong> {reservationDetails?.guestEmail || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Adults:</strong> {reservationDetails?.numberOfGuests || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Children:</strong> {reservationDetails?.children || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Check-in Date:</strong> {reservationDetails?.arrivalDate || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Check-in Time:</strong>{" "}
                    {reservationDetails?.checkInTime
                      ? formatTime(reservationDetails.checkInTime)
                      : guest.checkinTime
                      ? formatTime(guest.checkinTime)
                      : "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Check-out Date:</strong>{" "}
                    {reservationDetails?.departureDate || guest.checkoutDate || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    <strong>Check-out Time:</strong>{" "}
                    {reservationDetails?.checkOutTime
                      ? formatTime(reservationDetails.checkOutTime)
                      : guest.checkoutTime
                      ? formatTime(guest.checkoutTime)
                      : "N/A"}
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
                    <strong>Security Deposit:</strong>{" "}
                    {reservationDetails?.securityDeposit || "N/A"}{" "}
                    {reservationDetails?.currency || ""}
                  </MDTypography>
                </Grid>
              </Grid>
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
    listingName: "Listing Name",
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
            listingName: fields[FIELD_MAP.listingName]
              ? fields[FIELD_MAP.listingName].split("(")[0].trim()
              : "N/A",
            type: fields[FIELD_MAP.listingName]
              ? fields[FIELD_MAP.listingName].match(/\(([^)]+)\)/)?.[1] || "N/A"
              : "N/A",
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
