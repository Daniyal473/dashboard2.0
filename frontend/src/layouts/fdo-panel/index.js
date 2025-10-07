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
import Table from "react-bootstrap/Table";
import { Row, Col } from "react-bootstrap";

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
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  

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
      const guestName = reservation.guestName || "N/A";

      const cnic =
        reservation.customFieldValues?.find(
          (field) => field.customField?.name === "ID card Number/ Passport number"
        )?.value || "N/A";

      const listingMapId = guest.listingName || "N/A";
      const listingType = guest.type || "N/A";
      const contact = reservation.phone || "N/A";
      const duration = reservation.nights || "N/A";
      const totalPrice = reservation.totalPrice || "N/A";
      const currencyLabel = reservation.currency || "";
      let earlyCheckIn = "N/A";
      if (Array.isArray(reservation.financeField)) {
        // 🔹 Early Check-in Fee
        const earlyCheckinField = reservation.financeField.find(
          (field) => field.alias === "Early Checkin Charges per hour" && field.isDeleted === 0
        );
        if (earlyCheckinField) {
          earlyCheckIn = earlyCheckinField.total ?? earlyCheckinField.value ?? "N/A";
        }
      }

      let pricePerNight = "N/A";
      if (Array.isArray(reservation.customFieldValues)) {
        const priceField = reservation.customFieldValues.find(
          (field) => field.customField?.id === 63430
        );
        if (priceField) {
          pricePerNight = priceField.value || "N/A";
        }
      }
      const channelName = reservation.channelName || "N/A";

      const address =
        reservation.customFieldValues?.find((field) => field.customField?.name === "Address")
          ?.value ||
        guest.address ||
        "N/A";

      const email = reservation.guestEmail || "N/A";
      const adults = reservation.numberOfGuests || "N/A";
      const children = reservation.children || "N/A";
      const arrival = reservation.arrivalDate || "N/A";
      const checkInTime = reservation.checkInTime
        ? formatTime(reservation.checkInTime)
        : guest.checkinTime
        ? formatTime(guest.checkinTime)
        : "N/A";

      const departure = reservation.departureDate || guest.checkoutDate || "N/A";

      const checkOutTime = reservation.checkOutTime
        ? formatTime(reservation.checkOutTime)
        : guest.checkoutTime
        ? formatTime(guest.checkoutTime)
        : "N/A";

      const vehicleNumber =
        reservation.customFieldValues?.find((field) => field.customField?.name === "Vehicle Number")
          ?.value ||
        guest.vehicleNo ||
        "N/A";

      let securityDepositFee = "N/A";
      if (Array.isArray(reservation.financeField)) {
        const securityField = reservation.financeField.find(
          (field) => field.alias === "Security Deposit" && field.isDeleted === 0
        );
        if (securityField) {
          securityDepositFee = securityField.total ?? securityField.value ?? "N/A";
        }
      }

      let actualCheckInTime = "N/A";

      if (Array.isArray(reservation.customFieldValues)) {
        const checkInField = reservation.customFieldValues.find(
          (item) =>
            item.customField?.name === "Actual Check-in Time" && item.customFieldId === 76281
        );

        if (checkInField && checkInField.value) {
          const parsedDate = new Date(checkInField.value);
          if (!isNaN(parsedDate)) {
            actualCheckInTime = parsedDate.toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });
          } else {
            actualCheckInTime = checkInField.value; // fallback if not a date
          }
        }
      }

      const reservationId = reservation.reservationId || "N/A";

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

  const handlePrintCheckOut = async () => {
    try {
      // ✅ Fetch latest reservation from API
      const response = await fetch(`${HOSTAWAY_API}/${guest.reservationId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${HOSTAWAY_TOKEN}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      let damageCharges = "";

      const data = await response.json();
      const reservation = data.result || {};
      const guestName = reservation.guestName || "N/A";

      const listingMapId = guest.listingName || "N/A";
      const currencyLabel = reservation.currency || "";

      // ✅ Fetch Finance Fields from API (includes deposit and damage logic)
      const { lateCheckOutCharges, allTotalCharges, financeFields, CheckOutDamageDeposit } =
        await getFinanceFields(guest.reservationId);

      const channelName = reservation.channelName || "N/A";

      const departure = reservation.departureDate || guest.checkoutDate || "N/A";

      const checkOutTime = reservation.checkOutTime
        ? formatTime(reservation.checkOutTime)
        : guest.checkoutTime
        ? formatTime(guest.checkoutTime)
        : "N/A";

      const vehicleNumber =
        reservation.customFieldValues?.find((field) => field.customField?.name === "Vehicle Number")
          ?.value ||
        guest.vehicleNo ||
        "N/A";

      let CheckOutSecurityDeposit = "N/A";
      if (Array.isArray(reservation.financeField)) {
        const securityField = reservation.financeField.find(
          (field) => field.alias === "Security Deposit" && field.isDeleted === 0
        );
        if (securityField) {
          CheckOutSecurityDeposit = securityField.total ?? securityField.value ?? "N/A";
        }
      }

      let actualCheckOutTime = "N/A";

      if (Array.isArray(reservation.customFieldValues)) {
        const checkOutField = reservation.customFieldValues.find(
          (item) =>
            item.customField?.name === "Actual Check-out Time" && item.customFieldId === 76282
        );

        if (checkOutField && checkOutField.value) {
          const parsedDate = new Date(checkOutField.value);
          if (!isNaN(parsedDate)) {
            actualCheckOutTime = parsedDate.toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });
          } else {
            actualCheckOutTime = checkOutField.value; // fallback if not a date
          }
        }
      }

      const reservationId = reservation.reservationId || "N/A";

      const formWindow = window.open("", "_blank");

      // Fill guest details dynamically
      const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background-color: #F0F0F0;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
    }
    .form {
      width: 150mm;
      height: auto;
      min-height: 240mm;
      padding: 20px;
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
      margin: 10px 0px 20px 0px;
    }
    .logo-img img {
      height: 100%;
      width: auto;
      object-fit: contain;
    }
    h2 {
      text-align: center;
      font-size: 20px;
      margin: 10px 0;
    }
    p {
      line-height: 1.5;
      font-size: 17px;
    }
    ul {
      list-style: none;
      padding-left: 0;
      margin: 10px 0;
    }
    ul li {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
      line-height: 1.2;
      margin-bottom: 2px;
    }
  
    .signature-section {
      margin-top: 35px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .signature-block {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      margin: 30px auto 10px;
      width: 80%;
    }
    .footer {
      font-size: 12px;
      color: #666;
      display: inline-block;
      vertical-align: top;
      width: 50%;
      margin-top: -15px;
    }
    
    .charges-breakdown {
    margin: -15px 23px 0px 0px;
      padding: 15px;
      display: inline-block;
      vertical-align: top;
    }
    .charges-breakdown p {
      margin: 5px 0;
      font-size: 12px;
      color: #333;
      line-height: 1.3;
    }
    .charges-breakdown h6 {
      margin: 5px 0;
      font-size: 16px;
      color: #333;
      line-height: 1.3;
      font-family: math;
    }
    
    /* Container to hold both elements */
    .footer-container {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: -19px;
    }
}

    .charges-breakdown p:first-child {
      font-weight: bold !important;
      color: #2c3e50;
      font-size: 14px;
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
<div style="display: flex; flex-direction: row;">
    <div class="logo-img">
      <img src="img/booknrent-logo.png" alt="Booknrent Logo">
    </div>
    <div class="heading-text" style="margin: 20px 0px 0px 40px !important">
  ${(() => {
          const sameDayData = JSON.parse(
            localStorage.getItem(`sameDayCheckOut_${guest.reservationId}`) || "{}"
          );
          const earlyCheckOutData = JSON.parse(
            localStorage.getItem(`earlyCheckOut_${guest.reservationId}`) || "{}"
          );
          const isSameDayCheckout = sameDayData && sameDayData.value === "Yes";
          const isEarlyCheckOut =
            earlyCheckOutData && earlyCheckOutData.allowed === true;

    if (isSameDayCheckout) {
      return `<h3 style="text-align: center; margin: 0; font-size: 16px;">
                ${guestName}'s Same Day Check-out Form 
                <span style="font-size: 12px; color: #666;">(${guest.reservationId})</span>
              </h3>
              <p style="text-align: center; font-family: monospace; margin:0px 0px -16px 0px !important; font-size: 15px; width: 92%;">
                Actual Check-out Date / Time: ${actualCheckOutTime}
              </p>`;
    } else if (isEarlyCheckOut) {
      return `<h3 style="text-align: center; margin: 0; font-size: 16px;">
                ${guestName}'s Early Check-out Form 
                <span style="font-size: 12px; color: #666;">(${guest.reservationId})</span>
              </h3>
              <p style="text-align: center; font-family: monospace; margin:0px 0px -16px 0px !important; font-size: 15px; width: 92%;">
                Actual Check-out Date / Time: ${actualCheckOutTime}
              </p>`;
    } else {
      return `<h3 style="text-align: center; margin: 0; font-size: 16px;">
                ${guestName}'s Check-out Form 
                <span style="font-size: 12px; color: #666;">(${guest.reservationId})</span>
              </h3>
              <p style="text-align: center; font-family: monospace; margin:0px 0px -16px 0px !important; font-size: 15px; width: 92%;">
                Actual Check-out Date / Time: ${actualCheckOutTime}
              </p>`;
    }
  })()}
   </div>
</div>

    <p style="text-align: center; font-size: 18px;">
      I, <strong>${guestName}</strong>, have checked out of the apartment <strong>${listingMapId}</strong> on <strong>${departure}</strong>. 
      I have checked the apartment for any personal belongings, including but not limited to:
    </p>

    <div class="single-line-layout">
  <div class="items-list">
    <div class="list-item">• Clothes</div>
    <div class="list-item">• Jewelry</div>
    <div class="list-item">• Cash</div>
    <div class="list-item">• Electronics</div>
    <div class="list-item">• Other valuables</div>
  </div>
  <div class="info-fields">
  <div class="field-group">
    <span class="field-label">Vehicle Number:</span>
    <span class="field-value" style="text-transform: uppercase;">${vehicleNumber || "N/A"}</span>
  </div>

  <div class="field-group">
    <span class="field-label">Standard Check Out Date & Time:</span>
    <span class="field-value">${departure} & ${checkOutTime} pm</span>
  </div>

  <div class="field-group">
  <span class="field-label">Late Check out Charges (if applicable):</span>
  <span class="field-value">
    ${lateCheckOutCharges || "0"}
    ${channelName === "direct" ? currencyLabel : "Pkr"}
  </span>
</div>

<div class="field-group">
  <span class="field-label">Any other Charges (if applicable):</span>
  <span class="field-value">
   ${allTotalCharges ? Math.round(allTotalCharges) : "0"}
    ${channelName === "direct" ? currencyLabel : "Pkr"}
  </span>
</div>

<div class="field-group">
  <span class="field-label">Security Deposit Amount Returned:</span>
  <span class="field-value">
    ${CheckOutSecurityDeposit || "0"}
    ${channelName === "direct" ? currencyLabel : "Pkr"}
    <span style="font-weight: normal;">☐ Cash / ☐ IBFT</span>
  </span>
</div>

</div>


</div>

<style>
  .single-line-layout {
    display: flex;
    gap: 20px;
    margin: 45px 0;
  }

  .items-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .list-item {
    font-size: 14px;
    white-space: nowrap;
  }

  .info-fields {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid black;
    padding: 10px 5px 10px 15px;
    margin: -8px 0px 10px 0px;
  }

  .field-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .field-label {
    font-size: 13px;
    white-space: nowrap;
    min-width: 200px;
  }

  .field-value {
    font-size: 13px;
    font-weight: bold;
    white-space: nowrap;
  }
</style>

    <p style="font-size: 17px; text-align: center; margin-top: -15px;">
      I have found all of my belongings and have taken them with me. <br>
      I understand that the Apartment management/host is not responsible for any valuables that are left behind.
    </p>

    <div class="signature-section">
      <div class="signature-block">
        <div class="signature-line"></div>
        <p>Management Team</p>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <p>Guest Signature</p>
      </div>
    </div>
<div class="footer-container">
  <div class="footer">
    <p>📞 0300-0454711</p>
    <p>📍 30-A, Block L, Gulberg 3, Lahore</p>
  </div>

  ${
    allTotalCharges > 0
      ? `
    <div class="charges-breakdown">
      <h6 style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Charges Breakdown:</h6>
      ${
        financeFields.baseRate > 0
          ? `<p>• <strong>Base Rate:</strong> ${financeFields.baseRate.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.cleaningFeeValue > 0
          ? `<p>• <strong>Cleaning Fee:</strong> ${financeFields.cleaningFeeValue.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.additionalCleaningFee > 0
          ? `<p>• <strong>Cleaning Fee:</strong> ${financeFields.additionalCleaningFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.midstayCleaningFee > 0
          ? `<p>• <strong>Midstay Cleaning Fee:</strong> ${financeFields.midstayCleaningFee.toFixed(
              2
            )} ${currencyLabel}</p>`
            : ""
          }
     ${CheckOutDamageDeposit !== 0
            ? `<p>• <strong>Damage Deposit:</strong> ${CheckOutDamageDeposit} ${currencyLabel}</p>`
            : ""
          }
${CheckOutSecurityDeposit !== "0"
            ? `<p>• <strong>Security Deposit:</strong> ${CheckOutSecurityDeposit} ${currencyLabel}</p>`
            : ""
          }
      ${financeFields.salesTax > 0
            ? `<p>• <strong>Sales Tax:</strong> ${financeFields.salesTax.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.earlyCheckinFee > 0
          ? `<p>• <strong>Early Check-in Fee:</strong> ${financeFields.earlyCheckinFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.bedLinenFee > 0
          ? `<p>• <strong>Bed Linen Fee:</strong> ${financeFields.bedLinenFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.extraBedsFee > 0
          ? `<p>• <strong>Extra Beds Fee:</strong> ${financeFields.extraBedsFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.lateCheckoutFee > 0
          ? `<p>• <strong>Late Checkout Fee:</strong> ${financeFields.lateCheckoutFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.damageDeposit > 0
          ? `<p>• <strong>Damage Deposit:</strong> ${financeFields.damageDeposit.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.parkingFee > 0
          ? `<p>• <strong>Parking Fee:</strong> ${financeFields.parkingFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.serviceFee > 0
          ? `<p>• <strong>Service Fee:</strong> ${financeFields.serviceFee.toFixed(
              2
            )}  ${currencyLabel}</p>`
          : ""
      }
      ${
        financeFields.towelChangeFee > 0
          ? `<p>• <strong>Towel Change Fee:</strong> ${financeFields.towelChangeFee.toFixed(
              2
            )} ${currencyLabel}</p>`
          : ""
      }
    </div>
    `
      : ""
  }
</div>
<div>
<span style="margin-left: -19px;"> ✂----------------------------------------------------------------------------------------------------------
</span>
</div>
<div>
<div>
<div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
    <div style="flex: 1;">
      <p style="margin: 5px 0;"><strong>Guest Name:</strong> <br> ${guestName || "N/A"}</p>
    </div>
    <div style="flex: 1;">
      <p style="margin: 5px 0;">
  <strong>Vehicle Number:</strong> <br>
  <span style="text-transform: uppercase;">
    ${vehicleNumber || "N/A"}
  </span>
</p>

    </div>
  </div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
    
    <div style="flex: 1;">
      <p style="margin: 5px 0;"><strong>Apartment:</strong> <br> ${listingMapId || "N/A"}</p>
    </div>
    <div style="flex: 1;">
      <p style="margin: 5px 0;"><strong>Departure Date and Time:</strong> <br> ${
        actualCheckOutTime || "N/A"
      }</p>
    </div>
  </div>
  
    </div>
</div>
<p style="text-align: center; margin: -2px 0px -6px 0px;">Thank you for staying with <img src="img/booknrent-logo2.png" alt="Booknrent Logo" style="width: 95px; object-fit: contain; margin-bottom: -2px;">, Good Bye!</p>
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
    link.download = \`${guestName}'s Checkout-form ${guest.reservationId}.png\`;
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

  // ✅ New function for Mark Check Out
  const handleMarkCheckOut = async () => {
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
        (field) => field.customFieldId === 76282 && field.value && field.value.trim() !== ""
      );

      if (existingField) {
        console.log(`🛑 Check-Out already recorded: ${existingField.value}`);
        setIsCheckedOut(true); // ✅ already checked-out
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
              customFieldId: 76282,
              value: formattedDateTime,
            },
          ],
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to update reservation");

      console.log(`✅ Check-out time saved: ${formattedDateTime}`);
      setIsCheckedOut(true); // ✅ switch button
    } catch (err) {
      console.error("❌ Error in handleMarkCheckOut:", err);
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
      if (Array.isArray(result.financeField)) {
        const earlyCheckinField = result.financeField.find(
          (field) => field.alias === "Early Checkin Charges per hour" && field.isDeleted === 0
        );
        if (earlyCheckinField) {
          earlyCheckinCharges = earlyCheckinField.total ?? earlyCheckinField.value ?? "N/A";
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

      // 🔹 Calculate Remaining Balance
      let totalPaid = 0;
      let remainingBalance = "N/A";
      const totalPrice = result.totalPrice || 0;

      if (Array.isArray(result.financeField)) {
        const totalPaidField = result.financeField.find(
          (field) => field.name === "totalPaid" && field.isDeleted === 0
        );
        if (totalPaidField) {
          totalPaid = totalPaidField.total ?? totalPaidField.value ?? 0;
        }
      }

      if (totalPrice && totalPaid >= 0) {
        const balance = totalPrice - totalPaid;
        remainingBalance = balance > 0 ? balance.toFixed(2) : "0";
      }

      setReservationDetails({ ...result, pricePerNight, earlyCheckinCharges, securityDeposit, remainingBalance });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ Helper Function: Fetch Finance Fields for a Reservation
  async function getFinanceFields(reservationId) {
    try {
      const response = await fetch(
        `https://api.hostaway.com/v1/financeStandardField/reservation/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${HOSTAWAY_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch reservation finance fields");
        return {
          securityDepositFee: "",
          lateCheckOutCharges: "",
          allTotalCharges: "",
          financeFields: {},
          CheckOutSecurityDeposit: 0,
          CheckOutDamageDeposit: 0,
        };
      }

      const data = await response.json();
      const reservation = data.result || {};
      const financeFieldArray = data.result?.financeField || [];

      let CheckOutDamageDeposit = 0;

      // ✅ Find "Damage Fee" entry
      const damageDepositEntry = financeFieldArray.find((item) => item.alias === "Damage Fee");
      if (damageDepositEntry) {
        if (damageDepositEntry.isDeleted === 1) {
          CheckOutDamageDeposit = 0;
        } else {
          CheckOutDamageDeposit = damageDepositEntry.total ?? damageDepositEntry.value ?? 0;
        }
      }

      // ✅ Compute standard finance fields
      const financeFields = {
        baseRate: reservation.baseRate || 0,
        cleaningFeeValue: reservation.cleaningFeeValue || 0,
        additionalCleaningFee: reservation.additionalCleaningFee || 0,
        midstayCleaningFee: reservation.midstayCleaningFee || 0,
        otherFees: reservation.otherFees || 0,
        salesTax: reservation.salesTax || 0,
        earlyCheckinFee: reservation.earlyCheckinFee || 0,
        bedLinenFee: reservation.bedLinenFee || 0,
        extraBedsFee: reservation.extraBedsFee || 0,
        lateCheckoutFee: reservation.lateCheckoutFee || 0,
        damageDeposit: reservation.damageDeposit || 0,
        parkingFee: reservation.parkingFee || 0,
        serviceFee: reservation.serviceFee || 0,
        towelChangeFee: reservation.towelChangeFee || 0,
        allTotalCharges:
          (reservation.baseRate || 0) +
          (reservation.cleaningFeeValue || 0) +
          (reservation.additionalCleaningFee || 0) +
          (reservation.midstayCleaningFee || 0) +
          (reservation.otherFees || 0) +
          (reservation.salesTax || 0) +
          (reservation.earlyCheckinFee || 0) +
          (reservation.bedLinenFee || 0) +
          (reservation.extraBedsFee || 0) +
          (reservation.lateCheckoutFee || 0) +
          (reservation.damageDeposit || 0) +
          (reservation.parkingFee || 0) +
          (reservation.serviceFee || 0) +
          (reservation.towelChangeFee || 0),
        channelId: reservation.channelId,
      };

      // ✅ Convert USD → PKR for specific channels
      if (financeFields.channelId === 2018 || financeFields.channelId === 2013) {
        try {
          const exchangeResponse = await fetch(
            "https://v6.exchangerate-api.com/v6/e528361fb75219dbc48899b1/latest/USD"
          );
          const exchangeData = await exchangeResponse.json();
          const usdToPkrRate = exchangeData.conversion_rates.PKR;

          const convertedFields = { ...financeFields };
          Object.keys(convertedFields).forEach((key) => {
            if (typeof convertedFields[key] === "number") {
              convertedFields[key] = Number((convertedFields[key] * usdToPkrRate).toFixed(2));
            }
          });

          return {
            securityDepositFee: convertedFields.otherFees || "",
            lateCheckOutCharges: convertedFields.lateCheckoutFee || "",
            allTotalCharges: convertedFields.allTotalCharges || "",
            financeFields: convertedFields,
            CheckOutDamageDeposit,
          };
        } catch (exchangeError) {
          console.error("Error fetching exchange rate:", exchangeError);
        }
      }

      // ✅ Default return (no conversion)
      return {
        securityDepositFee: financeFields.otherFees || "",
        lateCheckOutCharges: financeFields.lateCheckoutFee || "",
        allTotalCharges: financeFields.allTotalCharges || "",
        financeFields,
        CheckOutDamageDeposit,
      };
    } catch (error) {
      console.error("Error fetching finance fields:", error);
      return {
        securityDepositFee: "",
        lateCheckOutCharges: "",
        allTotalCharges: "",
        financeFields: {},
        CheckOutSecurityDeposit: 0,
        CheckOutDamageDeposit: 0,
      };
    }
  }

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
        <MDTypography variant="subtitle2" color="dark" fontWeight="bold">
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
          <MDTypography variant="body2" color="text">
            {guest.aptStatus || "N/A"}
          </MDTypography>
        </MDBox>

        {/* Stay Duration */}
        <MDBox mt={1} mb={1}>
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
                  bgcolor: "dark.light",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            ))}
          </MDBox>
        )}

        {/* Preview Button */}
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpen}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              backgroundColor: "#28282B", // ✅ Black background
              color: "#ffffff", // ✅ White text
              borderColor: "#28282B", // ✅ Black border
              "&:hover": {
                backgroundColor: "#333333", // Slightly lighter black on hover
                borderColor: "#28282B",
              },
              "&:focus": {
                backgroundColor: "#000000",
              },
              "&:active": {
                backgroundColor: "#222222",
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
                  backgroundColor: "#28282B", // ✅ Black background
                  color: "#ffffff", // ✅ White text
                  borderColor: "#28282B", // ✅ Black border
                  "&:hover": {
                    backgroundColor: "#333333", // Slightly lighter black on hover
                    borderColor: "#28282B",
                  },
                  "&:focus": {
                    backgroundColor: "#000000",
                  },
                  "&:active": {
                    backgroundColor: "#222222",
                  },
                }}
              >
                Mark Check In
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  backgroundColor: "#28282B", // ✅ Black background
                  color: "#ffffff", // ✅ White text
                  borderColor: "#28282B", // ✅ Black border
                  "&:hover": {
                    backgroundColor: "#333333", // Slightly lighter black on hover
                    borderColor: "#28282B",
                  },
                  "&:focus": {
                    backgroundColor: "#000000",
                  },
                  "&:active": {
                    backgroundColor: "#222222",
                  },
                }}
                onClick={handlePrintCheckIn}
              >
                Print Check In
              </Button>
            ))}

          {/* Mark Check Out Button - show in all stacks apart from Upcoming Stay */}
          {guest.stack !== "Upcoming Stay" &&
            (!isCheckedOut ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleMarkCheckOut}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  backgroundColor: "#28282B", // ✅ Black background
                  color: "#ffffff", // ✅ White text
                  borderColor: "#28282B", // ✅ Black border
                  "&:hover": {
                    backgroundColor: "#333333", // Slightly lighter black on hover
                    borderColor: "#28282B",
                  },
                  "&:focus": {
                    backgroundColor: "#000000",
                  },
                  "&:active": {
                    backgroundColor: "#222222",
                  },
                }}
              >
                Mark Check Out
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  backgroundColor: "#28282B", // ✅ Black background
                  color: "#ffffff", // ✅ White text
                  borderColor: "#28282B", // ✅ Black border
                  "&:hover": {
                    backgroundColor: "#333333", // Slightly lighter black on hover
                    borderColor: "#28282B",
                  },
                  "&:focus": {
                    backgroundColor: "#000000",
                  },
                  "&:active": {
                    backgroundColor: "#222222",
                  },
                }}
                onClick={handlePrintCheckOut}
              >
                Print Check Out
              </Button>
            ))}
        </MDBox>
      </MDBox>
      {/* Preview Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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
            <Row>
              {/* Left Column */}
              <Col md={6}>
                <Table striped bordered hover size="sm">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Name</strong>
                      </td>
                      <td>{reservationDetails?.guestName || guest.guestName || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>CNIC</strong>
                      </td>
                      <td>
                        {reservationDetails?.customFieldValues?.find(
                          (field) => field.customField?.name === "ID card Number/ Passport number"
                        )?.value || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Unit</strong>
                      </td>
                      <td>{guest.listingName || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Contact</strong>
                      </td>
                      <td>{reservationDetails?.phone || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Total Nights</strong>
                      </td>
                      <td>{reservationDetails?.nights || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Total Amount</strong>
                      </td>
                      <td>
                        {reservationDetails?.totalPrice || "N/A"}{" "}
                        {reservationDetails?.currency || ""}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Remaining Balance</strong>
                      </td>
                      <td>
                        {reservationDetails?.remainingBalance || "N/A"}{" "}
                        {reservationDetails?.currency || ""}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Early Check-in</strong>
                      </td>
                      <td>
                        {reservationDetails?.earlyCheckinCharges || "N/A"}{" "}
                        {reservationDetails?.currency || ""}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Price/Night</strong>
                      </td>
                      <td>
                        {reservationDetails?.pricePerNight || "N/A"}{" "}
                        {reservationDetails?.currency || ""}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Vehicle No</strong>
                      </td>
                      <td>
                        {reservationDetails?.customFieldValues?.find(
                          (field) => field.customField?.name === "Vehicle Number"
                        )?.value ||
                          guest.vehicleNo ||
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Channel ID</strong>
                      </td>
                      <td>{reservationDetails?.channelName || "N/A"}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              {/* Right Column */}
              <Col md={6}>
                <Table striped bordered hover size="sm">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Reservation ID</strong>
                      </td>
                      <td>{guest.reservationId || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Address</strong>
                      </td>
                      <td>
                        {reservationDetails?.customFieldValues?.find(
                          (field) => field.customField?.name === "Address"
                        )?.value ||
                          guest.address ||
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Email</strong>
                      </td>
                      <td>{reservationDetails?.guestEmail || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Adults</strong>
                      </td>
                      <td>{reservationDetails?.numberOfGuests || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Children</strong>
                      </td>
                      <td>{reservationDetails?.children || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Payment Status</strong>
                      </td>
                      <td>{reservationDetails?.paymentStatus || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Check-in Date</strong>
                      </td>
                      <td>{reservationDetails?.arrivalDate || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Check-in Time</strong>
                      </td>
                      <td>
                        {reservationDetails?.checkInTime
                          ? formatTime(reservationDetails.checkInTime)
                          : guest.checkinTime
                          ? formatTime(guest.checkinTime)
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Check-out Date</strong>
                      </td>
                      <td>{reservationDetails?.departureDate || guest.checkoutDate || "N/A"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Check-out Time</strong>
                      </td>
                      <td>
                        {reservationDetails?.checkOutTime
                          ? formatTime(reservationDetails.checkOutTime)
                          : guest.checkoutTime
                          ? formatTime(guest.checkoutTime)
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Security Deposit</strong>
                      </td>
                      <td>
                        {reservationDetails?.securityDeposit || "N/A"}{" "}
                        {reservationDetails?.currency || ""}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
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
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              backgroundColor: "#28282B",
              color: "#ffffff",
              borderColor: "#28282B",
              "&:hover": { backgroundColor: "#333333", borderColor: "#28282B" },
              "&:focus": { backgroundColor: "#000000" },
              "&:active": { backgroundColor: "#222222" },
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
    reservationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    aptStatus: PropTypes.string,
    stayDuration: PropTypes.string,
    actualCheckin: PropTypes.string,
    actualCheckout: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    stack: PropTypes.string,
    cnic: PropTypes.string,
    unit: PropTypes.string,
    type: PropTypes.string,
    contact: PropTypes.string,
    totalNights: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    earlyCheckin: PropTypes.string,
    pricePerNight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    address: PropTypes.string,
    email: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    checkinDate: PropTypes.string,
    checkinTime: PropTypes.string,
    checkoutDate: PropTypes.string,
    checkoutTime: PropTypes.string,
    vehicleNo: PropTypes.string,
    security: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    listingName: PropTypes.string,
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
              ? fields[FIELD_MAP.listingName]
              : "N/A",
            type: fields[FIELD_MAP.listingName]
              ? (() => {
                const rawType =
                  fields[FIELD_MAP.listingName].match(/\(([^)]+)\)/)?.[1] || "N/A";
                const typeMap = {
                  "1B": "1 Bedroom",
                  "2B": "2 Bedroom",
                  "3B": "3 Bedroom",
                  "S": "Studio",
                };
                return typeMap[rawType] || rawType;
              })()
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
  
  
  const handleSync = async () => {
    try {
      console.log("🔄 Sync started...");

      const response = await fetch("https://n8n.namuve.com/webhook/68542fac-bcac-4458-be3c-bff32534caf9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggeredBy: "FDO Panel",
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      const data = await response.text();
      console.log("✅ Sync successful:", data);
    } catch (error) {
      console.error("❌ Sync failed:", error);
    }
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={2}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5">Kanban View</MDTypography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSync}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: "bold",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                    backgroundColor: "#28282B", // ✅ Black background
                    color: "#ffffff", // ✅ White text
                    borderColor: "#28282B", // ✅ Black border
                    "&:hover": {
                      backgroundColor: "#333333", // Slightly lighter black on hover
                      borderColor: "#28282B",
                    },
                    "&:focus": {
                      backgroundColor: "#000000",
                    },
                    "&:active": {
                      backgroundColor: "#222222",
                    },
                  }}
                >
                  Sync
                </Button>
              </MDBox>
              <MDBox
                display="flex"
                overflow="auto"
                px={2}
                pb={2}
                sx={{
                  "& > *:last-child": { mr: 0 },
                  // Desktop view (xl and up): Keep original layout
                  "@media (min-width: 1536px)": {
                    flexDirection: "row",
                    flexWrap: "nowrap",
                  },
                  // Laptop/Tablet view (lg and down): Single row layout
                  "@media (max-width: 1535px)": {
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    gap: 1,
                    "& > div": {
                      minWidth: "280px !important",
                      maxWidth: "280px",
                      flex: "0 0 280px",
                    },
                  },
                }}
              >
                {stacks.map((stack) => (
                  <MDBox
                    key={stack}
                    minWidth={360}
                    mr={2}
                    sx={{
                      // Desktop view: Keep original width
                      "@media (min-width: 1536px)": {
                        minWidth: 360,
                        marginRight: 2,
                      },
                      // Laptop/Tablet view: Smaller width for single row
                      "@media (max-width: 1535px)": {
                        minWidth: "280px !important",
                        maxWidth: "280px",
                        marginRight: 1,
                        flex: "0 0 280px",
                      },
                    }}
                  >
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
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#28282B",
                            }}
                          />
                        </MDBox>
                      </MDBox>

                      <MDBox px={2} pb={2}
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          overflowX: "hidden",
                          maxHeight: "calc(100vh - 350px)", // adjust if needed
                        }}>
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
