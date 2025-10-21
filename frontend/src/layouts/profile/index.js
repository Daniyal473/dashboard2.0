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

// React hooks
import { useState, useEffect, useRef } from "react";

// Authentication context
import { useAuth } from "context/AuthContext";

// @mui material components
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Menu from "@mui/material/Menu";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Overview() {
  const { user, isAuthenticated, loading: authLoading, isAdmin, isViewOnly, isCustom, hasPermission } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [roomTypeExpanded, setRoomTypeExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedStatusType, setSelectedStatusType] = useState(null); // 'HW' or 'HK'
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingOption, setUpdatingOption] = useState(null); // Track which option is updating
  const updateInProgress = useRef(false);
  
  // Focus mode state
  const [focusedCard, setFocusedCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Color scheme matching the provided image
  const statusColors = {
    // Activity Status Colors
    activity: {
      'Vacant': '#A78BFA',      // Light Purple (Car 1)
      'Occupied': '#F472B6',    // Pink (Car 2)  
      'Checkin': '#60A5FA',     // Light Blue (Truck)
      'Checkout': '#FB7185',    // Coral Pink (Scooter)
      'Unknown': '#9CA3AF'      // Gray (Van 1)
    },
    // HW Status Colors
    hw: {
      'Clean': '#6B7280',       // Grey color
      'Not Clean': '#F59E0B'    // Orange (instead of red)
    },
    // HK Status Colors  
    hk: {
      'Clean': '#34D399',       // Green (alternative to red)
      'Not Clean': '#F87171'    // Light Red/Coral
    }
  };

  // Function to get consistent color based on status type
  const getStatusColor = (statusType, statusValue) => {
    switch(statusType) {
      case 'activity':
        return statusColors.activity[statusValue] || statusColors.activity['Unknown'];
      case 'hw':
        return statusColors.hw[statusValue] || statusColors.hw['Not Clean'];
      case 'hk':
        return statusColors.hk[statusValue] || statusColors.hk['Not Clean'];
      default:
        return '#6B7280'; // Default gray
    }
  };

  // Comprehensive search function
  const matchesSearch = (listing, searchTerm) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    
    // Search in all relevant fields
    const searchFields = [
      listing.name,                    // Apartment name
      listing.guestName,              // Guest name
      listing.reservationId,          // Reservation ID
      listing.activity,               // Activity status
      listing.hwStatus,               // HW status
      listing.hkStatus,               // HK status
      listing.reservationStatus,      // Reservation status
      listing.checkInDate,            // Check-in date
      listing.checkOutDate,           // Check-out date
      listing.address,                // Address
      listing.location,               // Location
      listing.city,                   // City
      listing.country,                // Country
      String(listing.id)              // Listing ID
    ];
    
    return searchFields.some(field => 
      field && field.toString().toLowerCase().includes(search)
    );
  };

  // Handle card focus
  const handleCardFocus = (listing) => {
    if (focusedCard?.id === listing.id) {
      // If clicking the same card, exit focus mode
      exitFocusMode();
    } else {
      // Focus on new card
      setIsAnimating(true);
      setTimeout(() => {
        setFocusedCard(listing);
        setIsAnimating(false);
      }, 150);
    }
  };

  // Exit focus mode
  const exitFocusMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setFocusedCard(null);
      setIsAnimating(false);
    }, 150);
  };


  // Handle status click to open dropdown
  const handleStatusClick = (event, listing, statusType) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Check permissions - only allow users with complete access to rooms
    if (isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) {
      console.log('❌ User does not have permission to modify HW/HK status');
      alert('You do not have permission to modify room status. View-only access.');
      return;
    }
    
    // Close any existing menu first
    if (anchorEl) {
      handleMenuClose();
      return;
    }
    
    setAnchorEl(event.currentTarget);
    setSelectedListing(listing);
    setSelectedStatusType(statusType);
  };

  // Handle dropdown close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedListing(null);
    setSelectedStatusType(null);
    setIsUpdating(false); // Reset updating state when menu closes
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedListing || !selectedStatusType || isUpdating || updateInProgress.current) return;
    
    // Check permissions - only allow users with complete access to rooms
    if (isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) {
      console.log('❌ User does not have permission to update HW/HK status');
      alert('You do not have permission to modify room status. View-only access.');
      return;
    }
    
    updateInProgress.current = true;
    setIsUpdating(true);
    setUpdatingOption(newStatus);
    try {
      console.log(`🔄 Updating ${selectedStatusType} status for listing ${selectedListing.id} to: ${newStatus}`);
      console.log('🔄 Frontend request details:');
      console.log('  - URL:', `/api/rooms/update-cleaning-status/${selectedListing.id}`);
      console.log('  - Method: PUT');
      console.log('  - Body:', { statusType: selectedStatusType, newStatus: newStatus });
      
      const response = await fetch(`/api/rooms/update-cleaning-status/${selectedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusType: selectedStatusType,
          newStatus: newStatus
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📦 API Response:', result);
      
      if (result.success) {
        console.log(`✅ Successfully updated ${selectedStatusType} status`);
        
        // Update the local state immediately for better UX
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === selectedListing.id 
              ? { 
                  ...listing, 
                  [selectedStatusType === 'HW' ? 'hwStatus' : 'hkStatus']: newStatus 
                }
              : listing
          )
        );
        
        // Optionally refresh the data from server
        // fetchRoomListings(false);
        
      } else {
        console.error('❌ API returned error:', result);
        const errorMessage = result.message || result.error || 'Unknown error occurred';
        alert(`Failed to update ${selectedStatusType} status: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert(`Error updating ${selectedStatusType} status: ${error.message}`);
    } finally {
      updateInProgress.current = false;
      setIsUpdating(false);
      setUpdatingOption(null);
      handleMenuClose();
    }
  };

  // Fetch room listings from backend
  const fetchRoomListings = async (setLoadingState = true) => {
    try {
      if (setLoadingState) setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching room listings from /api/rooms/listings...');
      
      const response = await fetch('/api/rooms/listings');
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        setListings(data.data);
        console.log(`✅ Loaded ${data.data.length} room listings`);
        console.log('📋 First listing data:', data.data[0]);
        console.log('🧹 Cleaning status check:', data.data.map(listing => ({
          id: listing.id,
          name: listing.name,
          cleaningStatus: listing.cleaningStatus
        })));
      } else {
        setError(data.message || 'Failed to fetch room listings');
        console.error('❌ Failed to fetch listings:', data.error);
        console.error('❌ Full error response:', data);
      }
    } catch (err) {
      setError(`Unable to connect to server: ${err.message}`);
      console.error('❌ Network error:', err);
    } finally {
      if (setLoadingState) setLoading(false);
    }
  };

  // Fetch occupancy data from backend
  const fetchOccupancyData = async (setLoadingState = true) => {
    try {
      if (setLoadingState) setOccupancyLoading(true);
      setOccupancyError(null);
      
      console.log('🏨 Fetching occupancy data from /api/occupancy/current...');
      
      const response = await fetch('/api/occupancy/current');
      const data = await response.json();
      
      if (data.success) {
        setOccupancyData(data.data);
        console.log('✅ Loaded occupancy data:', data.data);
      } else {
        setOccupancyError(data.message || 'Failed to fetch occupancy data');
        console.error('❌ Failed to fetch occupancy:', data.error);
      }
    } catch (err) {
      setOccupancyError(`Unable to connect to server: ${err.message}`);
      console.error('❌ Occupancy network error:', err);
    } finally {
      if (setLoadingState) setOccupancyLoading(false);
    }
  };


  // Handle room type card click
  const handleRoomTypeClick = (roomType) => {
    setRoomTypeExpanded(prev => ({
      ...prev,
      [roomType]: !prev[roomType]
    }));
  };
  
  // Sample apartment data for room types (this would come from your API)
  const apartmentData = {
    'Studio': [
      { id: 'ST001', name: 'Studio Apartment A1', status: 'Available', floor: 'G', cleaningStatus: 'Clean' },
      { id: 'ST002', name: 'Studio Apartment A2', status: 'Available', floor: 'G', cleaningStatus: 'Clean' },
      { id: 'ST003', name: 'Studio Apartment A3', status: 'Available', floor: '1F', cleaningStatus: 'Not Clean' },
      { id: 'ST004', name: 'Studio Apartment A4', status: 'Reserved', floor: '1F', cleaningStatus: 'Clean', guestName: 'John Smith' }
    ],
    '1BR': [
      { id: '1BR001', name: '1BR Apartment C1', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: '1BR002', name: '1BR Apartment C2', status: 'Available', floor: '1F', cleaningStatus: 'Clean' },
      { id: '1BR003', name: '1BR Apartment C3', status: 'Available', floor: '2F', cleaningStatus: 'Not Clean' },
      { id: '1BR004', name: '1BR Apartment D1', status: 'Reserved', floor: '2F', cleaningStatus: 'Clean', guestName: 'David Brown' },
      { id: '1BR005', name: '1BR Apartment D2', status: 'Reserved', floor: '3F', cleaningStatus: 'Clean', guestName: 'Lisa Davis' },
      { id: '1BR006', name: '1BR Apartment D3', status: 'Reserved', floor: '3F', cleaningStatus: 'Not Clean', guestName: 'Tom Anderson' }
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
  
  // Get room type statistics from apartment data
  const getRoomTypeStats = (roomType) => {
    const apartments = apartmentData[roomType] || [];
    const available = apartments.filter(apt => apt.status === 'Available').length;
    const reserved = apartments.filter(apt => apt.status === 'Reserved').length;
    return { available, reserved, total: apartments.length };
  };
  
  // Get real listings filtered by room type
  const getRealListingsByRoomType = (roomType) => {
    // Debug: Log all apartment names to see what we're working with
    if (listings.length > 0) {
      console.log('🔍 Total listings:', listings.length);
      console.log('🔍 Sample apartment data:');
      listings.slice(0, 5).forEach((listing, index) => {
        console.log(`  ${index + 1}. Name: "${listing.name || 'NO NAME'}"`);
        console.log(`     Activity: "${listing.activity || 'NO ACTIVITY'}"`);
        console.log(`     Guest: "${listing.guestName || 'NO GUEST'}"`);
        console.log(`     Status: "${listing.cleaningStatus || 'NO STATUS'}"`);
        console.log('     ---');
      });
      console.log('🔍 Filtering for room type:', roomType);
    }
    
    const filtered = listings.filter(listing => {
      const name = listing.name?.toLowerCase() || '';
      
      // Filter based on your apartment naming pattern: Floor-Unit (BedroomCode)
      // Examples: "9F-85 (3B)", "1F-14 (2B)", "9F-82 (1B)"
      switch(roomType) {
        case 'Studio':
          return name.includes('(sb)') || 
                 name.includes('(st)') || 
                 name.includes('(studio)') ||
                 name.includes('(0b)');
                 
        case '1BR':
          return name.includes('(1b)');
                 
        case '2BR':
          // Check for (2B) but exclude premium indicators
          const has2B = name.includes('(2b)');
          const isPremium = name.includes('premium') || 
                           name.includes('deluxe') || 
                           name.includes('suite') ||
                           name.includes('luxury') ||
                           name.includes('prem');
          return has2B && !isPremium;
          
        case '2BR Premium':
          // Check for (2B) with premium indicators
          const has2BPrem = name.includes('(2b)');
          const isPremiumSuite = name.includes('premium') || 
                                name.includes('deluxe') || 
                                name.includes('suite') ||
                                name.includes('luxury') ||
                                name.includes('prem');
          return has2BPrem && isPremiumSuite;
          
        case '3BR':
          return name.includes('(3b)');
                 
        default:
          return false;
      }
    });
    
    console.log(`🔍 Found ${filtered.length} apartments for ${roomType}`);
    if (filtered.length > 0) {
      filtered.forEach((apt, index) => {
        console.log(`  ${index + 1}. "${apt.name}"`);
      });
    }
    return filtered;
  };

  // Handle cleaning status change
  const handleCleaningStatusChange = async (listingId, newStatus) => {
    try {
      console.log(`🔄 handleCleaningStatusChange called with listingId: "${listingId}", newStatus: "${newStatus}"`);
      
      // Prevent view_only users and custom users without complete access from making changes
      if (isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) {
        console.log('❌ User does not have permission to modify cleaning status');
        setError('You do not have permission to modify cleaning status');
        return;
      }
      
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required');
      }
      
      if (!newStatus) {
        throw new Error('New status is required');
      }
      
      // Set updating state for this specific listing
      setUpdatingStatus(prev => ({ ...prev, [listingId]: true }));
      
      const requestBody = { cleaningStatus: newStatus };
      console.log(`📤 Sending request to /api/rooms/cleaning-status/${listingId}`, requestBody);
      
      const response = await fetch(`/api/rooms/cleaning-status/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log(`📦 Response data:`, data);
      
      if (data.success) {
        console.log(`✅ Successfully updated cleaning status for listing ${listingId}`);
        
        // Update the local state immediately for better UX
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === listingId 
              ? { ...listing, cleaningStatus: newStatus }
              : listing
          )
        );
        
      } else {
        console.error('❌ Failed to update cleaning status:', data);
        const errorMessage = data.message || data.error || 'Unknown error occurred';
        setError(`Failed to update cleaning status: ${errorMessage}`);
        
        // Log debug info if available
        if (data.debug) {
          console.error('❌ Debug info:', data.debug);
        }
      }
      
    } catch (err) {
      console.error('❌ Error updating cleaning status:', err);
      setError(`Unable to update cleaning status: ${err.message}`);
    } finally {
      // Clear updating state for this listing
      setUpdatingStatus(prev => ({ ...prev, [listingId]: false }));
    }
  };

  // Test API health
  const testApiHealth = async () => {
    try {
      console.log('🏥 Testing Room API health...');
      const response = await fetch('/api/rooms/health');
      const data = await response.json();
      console.log('🏥 Health check result:', data);
    } catch (err) {
      console.error('🏥 Health check failed:', err);
    }
  };

  // Generate occupancy bar chart data
  const generateOccupancyBarData = () => {
    const roomTypes = ['Studio', '1BR', '2BR', '2BR Premium', '3BR'];
    const occupancyRates = [];
    
    roomTypes.forEach(roomType => {
      if (occupancyData?.roomTypes?.[roomType]) {
        const rate = (occupancyData.roomTypes[roomType].reserved / occupancyData.roomTypes[roomType].total * 100).toFixed(1);
        occupancyRates.push(parseFloat(rate));
      } else {
        // Default values if no data
        const defaultRates = { 'Studio': 30, '1BR': 35, '2BR': 40, '2BR Premium': 20, '3BR': 25 };
        occupancyRates.push(defaultRates[roomType]);
      }
    });

    return {
      labels: roomTypes,
      datasets: [
        {
          label: 'Occupancy Rate (%)',
          data: occupancyRates,
          backgroundColor: [
            '#FFA726', // Orange - Studio
            '#E91E63', // Pink - 1BR
            '#26A69A', // Teal - 2BR
            '#8D6E63', // Brown - 2BR Premium
            '#8BC34A', // Green - 3BR
          ],
          borderColor: [
            '#FF9800',
            '#C2185B',
            '#00897B',
            '#5D4037',
            '#689F38',
          ],
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 60,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y + '%';
          }
        }
      },
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            ctx.fillStyle = dataset.backgroundColor[index];
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(data + '%', bar.x, bar.y - 5);
          });
        });
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          stepSize: 20,
          font: {
            size: 11,
            color: '#666'
          },
          callback: function(value) {
            return value + '%';
          }
        },
        border: {
          display: true,
          color: '#ddd',
          width: 2
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#666'
        },
        border: {
          display: true,
          color: '#ddd',
          width: 2
        }
      }
    },
    layout: {
      padding: {
        top: 40,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  };

  // Fetch listings when component mounts
  useEffect(() => {
    if (isAuthenticated && (isAdmin() || (isCustom() && hasPermission('rooms', 'view')))) {
      testApiHealth(); // Test API first
      
      // Set both loading states to true initially
      setLoading(true);
      setOccupancyLoading(true);
      
      // Load both room listings and occupancy data simultaneously
      Promise.all([
        fetchRoomListings(false), // Don't let function manage its own loading state
        fetchOccupancyData(false)  // Don't let function manage its own loading state
      ]).then(() => {
        // Both data sets loaded, set both loading states to false
        console.log('✅ Both room listings and occupancy data loaded');
        setLoading(false);
        setOccupancyLoading(false);
      }).catch((error) => {
        console.error('❌ Error loading data:', error);
        setLoading(false);
        setOccupancyLoading(false);
      });
    }
  }, [isAuthenticated, isAdmin, isCustom, hasPermission]);

  // Auto-refresh removed as requested

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
          flexDirection="column"
        >
          <CircularProgress sx={{ mb: 2 }} />
          <MDTypography variant="h6" color="text.secondary" textAlign="center">
            Loading please wait...
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

  // Redirect users who don't have access to Rooms page
  if (!isAdmin() && !(isCustom() && hasPermission('rooms', 'view'))) {
    window.location.href = "/fdo-panel";
    return null;
  }


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      

      {/* Content Area */}
      <MDBox px={3}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {(loading || occupancyLoading) ? (
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
            flexDirection="column"
          >
            <CircularProgress sx={{ mb: 2 }} />
            <MDTypography variant="h6" color="text.secondary" textAlign="center">
              Loading please wait...
            </MDTypography>
          </MDBox>
        ) : (listings.length > 0 && !occupancyLoading) ? (
          // Show content only when both room listings and occupancy data are loaded
          <>
            {/* Content will be rendered below */}
          </>
        ) : (
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
            flexDirection="column"
          >
            <MDTypography variant="h6" color="text" mb={1}>
              No Rooms Found
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary" textAlign="center">
              No room listings are available at the moment.
              <br />
              Please check your Hostaway API configuration.
            </MDTypography>
          </MDBox>
        )}
      </MDBox>

      {/* Apartment Grid View - Desktop */}
      {listings.length > 0 && (
        <MDBox px={3} mb={3}>
          <Card sx={{ p: 3, backgroundColor: 'white', boxShadow: 3 }}>
            <MDBox display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={{ xs: 2, md: 0 }} mb={3}>
              <MDTypography variant="h5" color="text.primary" fontWeight="bold">
                🏢 Apartment Management
              </MDTypography>
              
              {/* Search Bar */}
              <MDBox sx={{ minWidth: { xs: '100%', md: '300px' } }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #e2e8f0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #cbd5e1'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #3b82f6'
                      }
                    }
                  }}
                />
              </MDBox>
            </MDBox>
            
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              {/* Desktop Grid View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{
                  display: focusedCard ? 'flex' : 'grid',
                  gridTemplateColumns: focusedCard ? 'none' : 'repeat(auto-fill, minmax(200px, 1fr))',
                  justifyContent: focusedCard ? 'center' : 'initial',
                  alignItems: focusedCard ? 'center' : 'initial',
                  gap: 2,
                  width: '100%',
                  minHeight: focusedCard ? '60vh' : 'auto'
                }}>
                  {/* Generate apartment cards */}
                  {listings
                    .filter(listing => 
                      (listing.country === 'Pakistan' || 
                       listing.country === 'PK' ||
                       (listing.address && listing.address.toLowerCase().includes('pakistan')) ||
                       (listing.location && listing.location.toLowerCase().includes('pakistan')) ||
                       (listing.city && ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala'].includes(listing.city.toLowerCase()))) &&
                      matchesSearch(listing, searchTerm) &&
                      (!focusedCard || listing.id === focusedCard.id) // Show only focused card when in focus mode
                    )
                    .map((listing, index) => (
                      <Card
                        key={listing.id}
                        onClick={() => handleCardFocus(listing)}
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: focusedCard?.id === listing.id ? 4 : 2,
                          p: focusedCard?.id === listing.id ? 4 : 2,
                          border: focusedCard?.id === listing.id ? '2px solid #3B82F6' : '1px solid #e2e8f0',
                          boxShadow: focusedCard?.id === listing.id ? '0 20px 40px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                          minHeight: focusedCard?.id === listing.id ? '400px' : '180px',
                          maxWidth: focusedCard?.id === listing.id ? '600px' : 'none',
                          width: focusedCard?.id === listing.id ? '100%' : 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transform: focusedCard?.id === listing.id ? 'scale(1.02)' : 'scale(1)',
                          opacity: isAnimating ? 0.7 : 1,
                          zIndex: focusedCard?.id === listing.id ? 1001 : 1,
                          position: focusedCard?.id === listing.id ? 'relative' : 'static',
                        }}
                      >
                        {/* Apartment ID Header */}
                        <MDBox sx={{ 
                          backgroundColor: '#f8fafc',
                          color: '#1e293b',
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          mb: 2,
                          textAlign: 'center',
                          border: '1px solid #e2e8f0',
                          position: 'relative',
                        }}>
                          <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: focusedCard?.id === listing.id ? '1.2rem' : '0.9rem' }}>
                            {listing.name || 'Unknown'}
                          </MDTypography>
                          
                          {/* Exit Button for Focused Card */}
                          {focusedCard?.id === listing.id && (
                            <MDBox
                              onClick={(e) => {
                                e.stopPropagation();
                                exitFocusMode();
                              }}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#EF4444',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                              }}
                            >
                              ×
                            </MDBox>
                          )}
                        </MDBox>

                        {/* Apartment Details */}
                        <MDBox sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Guest Info */}
                          <MDBox sx={{ mb: 1 }}>
                            <MDTypography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                              👤 {listing.guestName || 'N/A'}
                            </MDTypography>
                          </MDBox>
                          
                          {/* Status Info */}
                          <MDBox sx={{ mb: 1 }}>
                            <MDTypography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                              📅 {listing.checkInDate || 'N/A'} - {listing.checkOutDate || 'N/A'}
                            </MDTypography>
                          </MDBox>
                          
                          {/* Reservation ID */}
                          <MDBox sx={{ mb: 2 }}>
                            <MDTypography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                              🆔 {listing.reservationId || 'N/A'}
                            </MDTypography>
                          </MDBox>
                          
                          {/* Status Bars */}
                          <MDBox sx={{ mt: 'auto' }}>
                            {/* Activity Status Bar */}
                            <MDBox 
                              sx={{
                                backgroundColor: getStatusColor('activity', listing.activity),
                                color: 'black',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                mb: 1,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: '0.75rem', color: 'black' }}>
                                {listing.activity || 'Unknown'}
                              </MDTypography>
                            </MDBox>
                            
                            {/* HW Status Display - Conditionally Clickable */}
                            <MDBox 
                              onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HW')}
                              sx={{
                                backgroundColor: getStatusColor('hw', listing.hwStatus),
                                color: 'black',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                mb: 1,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0',
                                cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer'
                              }}
                            >
                              <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: '0.75rem', color: 'black' }}>
                                HW: {listing.hwStatus || 'Not Clean'}
                              </MDTypography>
                            </MDBox>
                            
                            {/* HK Status Display - Conditionally Clickable */}
                            <MDBox 
                              onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HK')}
                              sx={{
                                backgroundColor: getStatusColor('hk', listing.hkStatus),
                                color: 'black',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0',
                                cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer'
                              }}
                            >
                              <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: '0.75rem', color: 'black' }}>
                                HK: {listing.hkStatus || 'Not Clean'}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </Card>
                    ))}
                </Box>
              </Box>

              {/* Mobile Card View - Previous Layout Restored */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {listings
                  .filter(listing => 
                    (listing.country === 'Pakistan' || 
                     listing.country === 'PK' ||
                     (listing.address && listing.address.toLowerCase().includes('pakistan')) ||
                     (listing.location && listing.location.toLowerCase().includes('pakistan')) ||
                     (listing.city && ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala'].includes(listing.city.toLowerCase()))) &&
                    matchesSearch(listing, searchTerm)
                  )
                  .map((listing, index) => (
                    <Card 
                      key={listing.id}
                      sx={{ 
                        mb: 2, 
                        p: 3, 
                        backgroundColor: 'white',
                        boxShadow: 2,
                        borderRadius: 3,
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      {/* Header with Listing Name and Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <MDTypography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem' }}>
                          {listing.name || 'No Name Available'}
                        </MDTypography>
                        {/* Mobile HW and HK Status */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={`HW: ${listing.hwStatus || 'Not Clean'}`}
                            size="small"
                            onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HW')}
                            sx={{ 
                              fontSize: '0.7rem', 
                              height: '24px',
                              fontWeight: 'bold',
                              backgroundColor: getStatusColor('hw', listing.hwStatus),
                              color: '#000000',
                              border: '1px solid #e2e8f0',
                              cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer'
                            }}
                          />
                          <Chip
                            label={`HK: ${listing.hkStatus || 'Not Clean'}`}
                            size="small"
                            onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HK')}
                            sx={{ 
                              fontSize: '0.7rem', 
                              height: '24px',
                              fontWeight: 'bold',
                              backgroundColor: getStatusColor('hk', listing.hkStatus),
                              color: '#000000',
                              border: '1px solid #e2e8f0',
                              cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer'
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Data Fields */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <MDTypography variant="body1" fontWeight="bold" color="text.primary" sx={{ minWidth: '120px', flexShrink: 0 }}>
                            Reservation ID
                          </MDTypography>
                          <MDTypography variant="body1" color="text.primary" sx={{ textAlign: 'right' }}>
                            {listing.reservationId || 'N/A'}
                          </MDTypography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <MDTypography variant="body1" fontWeight="bold" color="text.primary" sx={{ minWidth: '120px', flexShrink: 0 }}>
                            Check-In Date
                          </MDTypography>
                          <MDTypography variant="body1" color="text.primary" sx={{ textAlign: 'right' }}>
                            {listing.checkInDate || 'N/A'}
                          </MDTypography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <MDTypography variant="body1" fontWeight="bold" color="text.primary" sx={{ minWidth: '120px', flexShrink: 0 }}>
                            Check-out Date
                          </MDTypography>
                          <MDTypography variant="body1" color="text.primary" sx={{ textAlign: 'right' }}>
                            {listing.checkOutDate || 'N/A'}
                          </MDTypography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <MDTypography variant="body1" fontWeight="bold" color="text.primary" sx={{ minWidth: '120px', flexShrink: 0 }}>
                            Guest Name
                          </MDTypography>
                          <MDTypography variant="body1" color="text.primary" sx={{ textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%' }}>
                            {listing.guestName || 'N/A'}
                          </MDTypography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <MDTypography variant="body1" fontWeight="bold" color="text.primary" sx={{ flex: 1, pr: 2 }}>
                            Status
                          </MDTypography>
                          <Chip
                            label={listing.reservationStatus || 'N/A'}
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem', 
                              height: '24px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                              backgroundColor: 
                                listing.reservationStatus === 'Upcoming Stay' || listing.reservationStatus === 'Confirmed' ? '#3B82F6' : 
                                listing.reservationStatus === 'Cancelled' || listing.reservationStatus === 'Checkout' ? '#EF4444' : 
                                listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Checked In' ? '#F59E0B' : '#6B7280',
                              color: '#FFFFFF',
                              '&:hover': {
                                backgroundColor: 
                                  listing.reservationStatus === 'Upcoming Stay' || listing.reservationStatus === 'Confirmed' ? '#2563EB' : 
                                  listing.reservationStatus === 'Cancelled' || listing.reservationStatus === 'Checkout' ? '#DC2626' : 
                                  listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Checked In' ? '#D97706' : '#4B5563'
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <MDTypography variant="body1" fontWeight="bold" color="text.primary" sx={{ minWidth: '120px', flexShrink: 0 }}>
                            Activity
                          </MDTypography>
                          <Chip
                            label={listing.activity || 'Unknown'}
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem', 
                              height: '24px',
                              fontWeight: 'bold',
                              backgroundColor: getStatusColor('activity', listing.activity),
                              color: '#000000',
                              border: '1px solid #e2e8f0'
                            }}
                          />
                        </Box>
                      </Box>
                    </Card>
                  ))}
              </Box>
            </Box>
          </Card>
        </MDBox>
      )}

      {/* Daily Occupancy & Revenue Report - Enhanced White Background Design */}
      {occupancyData && !loading && !occupancyLoading && (
        <MDBox px={3} mb={3}>
          <Card sx={{ 
            p: 4, 
            mb: 3, 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            borderRadius: 3,
            border: '1px solid #f1f5f9'
          }}>
            <MDBox sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '2px solid #e2e8f0'
            }}>
              <MDTypography variant="h4" color="text.primary" mb={2} fontWeight="bold" sx={{ 
                textAlign: 'center',
                color: '#1e293b',
                fontSize: '1.8rem'
              }}>
                📊 Daily Occupancy & Revenue Report
              </MDTypography>
              
              <MDBox sx={{ 
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                p: 2,
                mb: 2,
                border: '1px solid #e2e8f0'
              }}>
                <MDTypography variant="h6" color="text.primary" sx={{ 
                  textAlign: 'center',
                  color: '#475569',
                  fontWeight: 'medium'
                }}>
                  Report Date: {occupancyData.reportDate}
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <MDBox sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: 2,
              p: 3,
              mb: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDBox sx={{ 
                    backgroundColor: '#f0f9ff',
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid #bae6fd',
                    textAlign: 'center'
                  }}>
                    <MDTypography variant="body1" color="text.primary" sx={{ color: '#0369a1', fontWeight: 'medium' }}>
                      🕒 Report Period
                    </MDTypography>
                    <MDTypography variant="h6" color="text.primary" sx={{ color: '#0c4a6e', fontWeight: 'bold' }}>
                      {occupancyData.reportDate}, 12:00 AM - {occupancyData.reportTime}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox sx={{ 
                    backgroundColor: '#f0fdf4',
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid #bbf7d0',
                    textAlign: 'center'
                  }}>
                    <MDTypography variant="body1" color="text.primary" sx={{ color: '#166534', fontWeight: 'medium' }}>
                      📈 Occupancy Rate
                    </MDTypography>
                    <MDTypography variant="h6" color="text.primary" sx={{ color: '#14532d', fontWeight: 'bold' }}>
                      {occupancyData.occupancyRate}% ({occupancyData.totalReserved}/{occupancyData.totalRooms})
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '1px solid #e2e8f0'
            }}>
              <MDTypography variant="h5" color="text.primary" mb={3} fontWeight="bold" sx={{ 
                textAlign: 'center',
                color: '#1e293b',
                fontSize: '1.4rem'
              }}>
                🏨 Room Availability & Cleaning Status
              </MDTypography>
            
            <Grid container spacing={2}>
              {['Studio', '1BR', '2BR', '2BR Premium', '3BR'].map((roomType) => {
                const data = occupancyData.roomTypes?.[roomType] || { available: 0, reserved: 0, total: 0 };
                const stats = getRoomTypeStats(roomType);
                const isExpanded = roomTypeExpanded[roomType];
                
                return (
                <Grid item xs={12} sm={6} md={2.4} key={roomType}>
                  <MDBox>
                    <Card 
                      onClick={() => handleRoomTypeClick(roomType)}
                      sx={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: 3, 
                        p: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        border: '2px solid #f1f5f9',
                        minHeight: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          border: '2px solid #e2e8f0',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <MDBox textAlign="center">
                        <MDBox sx={{ 
                          backgroundColor: '#f8fafc',
                          borderRadius: 2,
                          p: 1.5,
                          mb: 2,
                          border: '1px solid #e2e8f0'
                        }}>
                          <MDTypography variant="h6" fontWeight="bold" sx={{ 
                            color: '#1e293b',
                            fontSize: '1.1rem'
                          }}>
                            {roomType} {isExpanded ? '▼' : '▶'}
                          </MDTypography>
                        </MDBox>
                        
                        <MDBox sx={{ 
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          p: 1.5,
                          border: '1px solid #f1f5f9'
                        }}>
                          <MDTypography variant="body2" sx={{ 
                            lineHeight: 1.6,
                            color: '#475569',
                            fontWeight: 'medium'
                          }}>
                            Available: <strong style={{ color: '#059669', fontSize: '1rem' }}>{getRealListingsByRoomType(roomType).filter(l => l.activity === 'Vacant').length}</strong>
                          </MDTypography>
                          <MDTypography variant="body2" sx={{ 
                            lineHeight: 1.6,
                            color: '#475569',
                            fontWeight: 'medium',
                            mt: 0.5
                          }}>
                            Reserved: <strong style={{ color: '#dc2626', fontSize: '1rem' }}>{getRealListingsByRoomType(roomType).filter(l => l.activity === 'Occupied').length}</strong>
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Card>
                    
                    {/* Expandable Apartment Details - White Background */}
                    {isExpanded && (
                      <MDBox 
                        mt={2} 
                        sx={{
                          backgroundColor: '#ffffff',
                          borderRadius: 3,
                          p: 3,
                          maxHeight: '400px',
                          overflow: 'auto',
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      >
                        <MDBox sx={{ 
                          backgroundColor: '#f8fafc',
                          borderRadius: 2,
                          p: 2,
                          mb: 3,
                          border: '1px solid #e2e8f0'
                        }}>
                          <MDTypography 
                            variant="h6" 
                            sx={{ 
                              color: '#1e293b', 
                              fontWeight: 'bold',
                              textAlign: 'center',
                              fontSize: '1.2rem'
                            }}
                          >
                            {roomType} Apartments
                          </MDTypography>
                        </MDBox>
                        
                        <MDBox display="flex" flexDirection="column" gap={1}>
                          {getRealListingsByRoomType(roomType).length > 0 ? (
                            getRealListingsByRoomType(roomType).map((listing) => (
                              <Card 
                                key={listing.id}
                                sx={{
                                  backgroundColor: '#ffffff',
                                  borderRadius: 2,
                                  p: 2,
                                  mb: 2,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                  border: '1px solid #e2e8f0',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-1px)'
                                  }
                                }}
                              >
                                {/* Apartment Name Header */}
                                <MDBox sx={{ 
                                  backgroundColor: '#ffffff',
                                  borderRadius: 1,
                                  p: 1.5,
                                  mb: 2,
                                  border: '1px solid #f1f5f9',
                                  textAlign: 'left'
                                }}>
                                  <MDTypography variant="h6" fontWeight="bold" sx={{ 
                                    color: '#1e293b',
                                    fontSize: '1rem',
                                    mb: 0
                                  }}>
                                    {listing.name || 'Unknown Apartment'}
                                  </MDTypography>
                                </MDBox>

                                {/* Content in Rows */}
                                <MDBox sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  
                                  {/* Status Row */}
                                  <MDBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px'
                                      }}>
                                        <MDTypography sx={{ fontSize: '0.7rem' }}>📍</MDTypography>
                                      </MDBox>
                                      <MDTypography variant="body2" sx={{ 
                                        color: '#475569',
                                        fontWeight: 'medium',
                                        minWidth: '60px'
                                      }}>
                                        Status:
                                      </MDTypography>
                                    </MDBox>
                                    <Chip
                                      label={listing.activity || 'Unknown'}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: listing.activity === 'Vacant' ? '#dcfce7' : '#fee2e2',
                                        color: listing.activity === 'Vacant' ? '#166534' : '#dc2626',
                                        border: `1px solid ${listing.activity === 'Vacant' ? '#bbf7d0' : '#fecaca'}`
                                      }}
                                    />
                                  </MDBox>

                                  {/* Guest Row */}
                                  <MDBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px'
                                      }}>
                                        <MDTypography sx={{ fontSize: '0.7rem' }}>👤</MDTypography>
                                      </MDBox>
                                      <MDTypography variant="body2" sx={{ 
                                        color: '#475569',
                                        fontWeight: 'medium',
                                        minWidth: '60px'
                                      }}>
                                        Guest:
                                      </MDTypography>
                                    </MDBox>
                                    <MDTypography variant="body2" sx={{ 
                                      color: '#1e293b',
                                      fontWeight: 'medium',
                                      textAlign: 'right',
                                      maxWidth: '150px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {listing.guestName || 'N/A'}
                                    </MDTypography>
                                  </MDBox>

                                  {/* HW Status Row */}
                                  <MDBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: listing.hwStatus === 'Clean' ? '#f0fdf4' : '#fef2f2',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px'
                                      }}>
                                        <MDTypography sx={{ fontSize: '0.7rem' }}>🧹</MDTypography>
                                      </MDBox>
                                      <MDTypography variant="body2" sx={{ 
                                        color: '#475569',
                                        fontWeight: 'medium',
                                        minWidth: '60px'
                                      }}>
                                        HW:
                                      </MDTypography>
                                    </MDBox>
                                    <Chip
                                      label={listing.hwStatus || 'Not Clean'}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: listing.hwStatus === 'Clean' ? '#dcfce7' : '#fee2e2',
                                        color: listing.hwStatus === 'Clean' ? '#166534' : '#dc2626',
                                        border: `1px solid ${listing.hwStatus === 'Clean' ? '#bbf7d0' : '#fecaca'}`
                                      }}
                                    />
                                  </MDBox>

                                  {/* HK Status Row */}
                                  <MDBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: listing.hkStatus === 'Clean' ? '#f3f4f6' : '#fdf2f8',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px'
                                      }}>
                                        <MDTypography sx={{ fontSize: '0.7rem' }}>🏠</MDTypography>
                                      </MDBox>
                                      <MDTypography variant="body2" sx={{ 
                                        color: '#475569',
                                        fontWeight: 'medium',
                                        minWidth: '60px'
                                      }}>
                                        HK:
                                      </MDTypography>
                                    </MDBox>
                                    <Chip
                                      label={listing.hkStatus || 'Not Clean'}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: listing.hkStatus === 'Clean' ? '#f3e8ff' : '#fdf2f8',
                                        color: listing.hkStatus === 'Clean' ? '#7c3aed' : '#ec4899',
                                        border: `1px solid ${listing.hkStatus === 'Clean' ? '#d8b4fe' : '#f9a8d4'}`
                                      }}
                                    />
                                  </MDBox>

                                  {/* Check-in Row - Only show if exists */}
                                  {listing.checkInDate && (
                                    <MDBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                        <MDBox sx={{ 
                                          backgroundColor: '#e0f2fe',
                                          borderRadius: '50%',
                                          p: 0.5,
                                          mr: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          minWidth: '24px',
                                          height: '24px'
                                        }}>
                                          <MDTypography sx={{ fontSize: '0.7rem' }}>📅</MDTypography>
                                        </MDBox>
                                        <MDTypography variant="body2" sx={{ 
                                          color: '#475569',
                                          fontWeight: 'medium',
                                          minWidth: '60px'
                                        }}>
                                          Check-in:
                                        </MDTypography>
                                      </MDBox>
                                      <MDTypography variant="body2" sx={{ 
                                        color: '#1e293b',
                                        fontWeight: 'medium',
                                        textAlign: 'right'
                                      }}>
                                        {listing.checkInDate}
                                      </MDTypography>
                                    </MDBox>
                                  )}

                                </MDBox>
                              </Card>
                            ))
                          ) : (
                            <MDBox 
                              sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                textAlign: 'center',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <MDTypography variant="body2" sx={{ 
                                color: '#64748b',
                                fontWeight: 'medium',
                                mb: 1
                              }}>
                                📭 No {roomType} apartments found in current listings
                              </MDTypography>
                              <MDTypography variant="caption" sx={{ 
                                color: '#94a3b8', 
                                display: 'block', 
                                mt: 1,
                                fontWeight: 'medium'
                              }}>
                                Total listings available: {listings.length}
                              </MDTypography>
                              {listings.length > 0 && (
                                <MDTypography variant="caption" sx={{ 
                                  color: '#cbd5e1', 
                                  display: 'block', 
                                  mt: 0.5,
                                  fontStyle: 'italic'
                                }}>
                                  Check console for apartment names
                                </MDTypography>
                              )}
                            </MDBox>
                          )}
                        </MDBox>
                      </MDBox>
                    )}
                  </MDBox>
                </Grid>
                );
              })}
            </Grid>
            </MDBox>
            
          </Card>

          {/* Occupancy Bar Chart - Enhanced White Background */}
          <Card sx={{ 
            p: 4, 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            borderRadius: 3,
            border: '1px solid #f1f5f9'
          }}>
            <MDBox sx={{ 
              backgroundColor: '#f8fafc',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '1px solid #e2e8f0'
            }}>
              <MDTypography variant="h5" color="text.primary" fontWeight="bold" sx={{ 
                textAlign: 'center',
                color: '#1e293b',
                fontSize: '1.4rem'
              }}>
                📊 Current Occupancy by Room Type
              </MDTypography>
            </MDBox>
            
            <MDBox sx={{ 
              height: '400px', 
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: 2,
              p: 2,
              border: '1px solid #f1f5f9'
            }}>
              <Bar data={generateOccupancyBarData()} options={chartOptions} />
            </MDBox>
          </Card>
        </MDBox>
      )}

      {/* Occupancy loading is now handled by main loading state */}

      {/* Occupancy Error State */}
      {occupancyError && (
        <MDBox px={3} mb={3}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <MDTypography variant="body2">
              <strong>Occupancy Data Unavailable:</strong> {occupancyError}
            </MDTypography>
          </Alert>
        </MDBox>
      )}
      
      {/* Focus Mode Backdrop */}
      {focusedCard && (
        <MDBox
          onClick={exitFocusMode}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            opacity: isAnimating ? 0 : 1,
            transition: 'all 0.3s ease'
          }}
        />
      )}
      
      {/* Status Update Dropdown Menu */}
      <Menu
        key={`status-menu-${selectedListing?.id}-${selectedStatusType}`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
            minWidth: 150
          }
        }}
      >
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleStatusUpdate('Clean');
          }}
          disabled={isUpdating}
          sx={{
            color: '#3B82F6',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#EBF8FF'
            }
          }}
        >
          {isUpdating && updatingOption === 'Clean' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              Updating...
            </Box>
          ) : (
            '✅ Clean'
          )}
        </MenuItem>
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleStatusUpdate('Not Clean');
          }}
          disabled={isUpdating}
          sx={{
            color: '#F59E0B',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#FEF3C7'
            }
          }}
        >
          {isUpdating && updatingOption === 'Not Clean' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              Updating...
            </Box>
          ) : (
            '❌ Not Clean'
          )}
        </MenuItem>
      </Menu>

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
