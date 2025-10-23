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

// API Configuration
import { API_ENDPOINTS } from "config/api";

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
  const [selectedStatusType, setSelectedStatusType] = useState(null); // 'HA' or 'HK'
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingOption, setUpdatingOption] = useState(null); // Track which option is updating
  const updateInProgress = useRef(false);
  
  // Focus mode state
  const [focusedCard, setFocusedCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [originalScrollPosition, setOriginalScrollPosition] = useState(0);
  
  // Animation states
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [rippleEffect, setRippleEffect] = useState({ active: false, x: 0, y: 0 });

  // Enhanced color scheme with better contrast and professional appearance
  const statusColors = {
    // Activity Status Colors - Unique colors not used elsewhere
    activity: {
      'Vacant': '#06B6D4',      // Cyan 500 - Available/Free (unique cyan)
      'Occupied': '#EC4899',    // Pink 500 - Busy/Occupied (unique pink)
      'Checkin': '#3B82F6',     // Blue 500 - Arriving (unique blue)
      'Checkout': '#F59E0B',    // Orange 500 - Departing (unique orange)
      'Unknown': '#6B7280'      // Gray 500 - Unknown status
    },
    // HA Status Colors - Professional blue and amber theme
    hw: {
      'Clean': '#0891B2',       // Cyan 600 - Clean/Good (high contrast)
      'Not Clean': '#F59E0B'    // Amber 500 - Needs attention (high contrast)
    },
    // HK Status Colors - Professional orange and rose theme
    hk: {
      'Clean': '#EA580C',       // Orange 600 - Clean/Fresh (unique color)
      'Not Clean': '#E11D48'    // Rose 600 - Needs cleaning (high contrast)
    },
    // Reservation Status Colors - Professional high contrast scheme
    reservation: {
      'Confirmed': '#2563EB',        // Blue 600 - Confirmed (high contrast)
      'Upcoming Stay': '#7C3AED',    // Violet 600 - Future (high contrast)
      'Current Stay': '#059669',     // Emerald 600 - Active/Current (high contrast)
      'Staying Guest': '#6B7280',    // Gray 500 - Staying Guest (neutral)
      'Checked In': '#059669',       // Emerald 600 - Active (high contrast)
      'Cancelled': '#DC2626',        // Red 600 - Cancelled (high contrast)
      'Checkout': '#D97706',         // Amber 600 - Ending (high contrast)
      'Pending': '#6B7280',          // Gray 500 - Waiting (neutral)
      'N/A': '#9CA3AF'               // Gray 400 - Not applicable
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
      case 'reservation':
        return statusColors.reservation[statusValue] || statusColors.reservation['N/A'];
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
      listing.hwStatus,               // HA status
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
      // Store current scroll position before focusing
      setOriginalScrollPosition(window.scrollY);
      // Focus on new card
      setIsAnimating(true);
      setTimeout(() => {
        setFocusedCard(listing);
        setIsAnimating(false);
        // Scroll focused card into view
        setTimeout(() => {
          const focusedElement = document.querySelector(`[data-listing-id="${listing.id}"]`);
          if (focusedElement) {
            focusedElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }
        }, 200);
      }, 150);
    }
  };

  // Exit focus mode
  const exitFocusMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setFocusedCard(null);
      setIsAnimating(false);
      // Restore original scroll position
      setTimeout(() => {
        window.scrollTo({
          top: originalScrollPosition,
          behavior: 'smooth'
        });
      }, 200);
    }, 150);
  };


  // Handle status click to open dropdown
  const handleStatusClick = (event, listing, statusType) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Check permissions - only allow users with complete access to rooms
    if (isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) {
      // console.log('❌ User does not have permission to modify HA/HK status');
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
      // console.log('❌ User does not have permission to update HA/HK status');
      alert('You do not have permission to modify room status. View-only access.');
      return;
    }
    
    updateInProgress.current = true;
    setIsUpdating(true);
    setUpdatingOption(newStatus);
    try {
      // console.log(`🔄 Updating ${selectedStatusType} status for listing ${selectedListing.id} to: ${newStatus}`);
      // console.log('🔄 Frontend request details:');
      // console.log('  - URL:', `/api/rooms/update-cleaning-status/${selectedListing.id}`);
      // console.log('  - Method: PUT');
      // console.log('  - Body:', { statusType: selectedStatusType, newStatus: newStatus });
      
      // Map HA back to HW for API compatibility
      const apiStatusType = selectedStatusType === 'HA' ? 'HW' : selectedStatusType;
      
      const response = await fetch(`${API_ENDPOINTS.ROOMS_UPDATE_CLEANING_STATUS}/${selectedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusType: apiStatusType,
          newStatus: newStatus
        })
      });

      // console.log('📡 Response status:', response.status);
      // console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      // console.log('📦 API Response:', result);
      
      if (result.success) {
        // console.log(`✅ Successfully updated ${selectedStatusType} status`);
        
        // Update the local state immediately for better UX
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === selectedListing.id 
              ? { 
                  ...listing, 
                  [selectedStatusType === 'HA' ? 'hwStatus' : 'hkStatus']: newStatus 
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
      
      // console.log('🔄 Fetching room listings from /api/rooms/listings...');
      
      const response = await fetch(API_ENDPOINTS.ROOMS_LISTINGS);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      // console.log('📦 Response data:', data);
      
      if (data.success) {
        setListings(data.data);
        console.log(`✅ Loaded ${data.data.length} room listings`);
        console.log('🔍 Reservation Status check:', data.data.map(listing => ({
          id: listing.id,
          name: listing.name,
          reservationStatus: listing.reservationStatus
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
      
      // console.log('🏨 Fetching occupancy data from /api/occupancy/current...');
      
      const response = await fetch(API_ENDPOINTS.OCCUPANCY_CURRENT);
      const data = await response.json();
      
      if (data.success) {
        setOccupancyData(data.data);
        // console.log('✅ Loaded occupancy data:', data.data);
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
    const filtered = listings.filter(listing => {
      const name = listing.name?.toLowerCase() || '';
      const listingId = listing.id;
      
      // Define 2BR Premium listing IDs (same as backend)
      const premiumListingIds = [305055, 309909, 323227, 288688];
      
      // Filter based on apartment naming pattern and listing IDs
      switch(roomType) {
        case 'Studio':
          // Look for Studio patterns - check if any apartments actually have these patterns
          return name.includes('(s)') || 
                 name.includes('(sb)') || 
                 name.includes('(st)') || 
                 name.includes('studio') ||
                 name.includes('(0b)');
                 
        case '1BR':
          return name.includes('(1b)');
                 
        case '2BR':
          // Check for (2B) but exclude premium listings by ID
          const has2B = name.includes('(2b)');
          const isPremiumById = listingId && premiumListingIds.includes(parseInt(listingId));
          return has2B && !isPremiumById;
          
        case '2BR Premium':
          // Check for premium listings by ID first, then name patterns
          const isPremiumByIdCheck = listingId && premiumListingIds.includes(parseInt(listingId));
          const has2BPrem = name.includes('(2b)');
          const isPremiumByName = name.includes('premium') || 
                                name.includes('deluxe') || 
                                name.includes('suite') ||
                                name.includes('luxury') ||
                                name.includes('prem');
          return isPremiumByIdCheck || (has2BPrem && isPremiumByName);
          
        case '3BR':
          return name.includes('(3b)');
                 
        default:
          return false;
      }
    });
    
    return filtered;
  };

  // Handle cleaning status change
  const handleCleaningStatusChange = async (listingId, newStatus) => {
    try {
      // console.log(`🔄 handleCleaningStatusChange called with listingId: "${listingId}", newStatus: "${newStatus}"`);
      
      // Prevent view_only users and custom users without complete access from making changes
      if (isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) {
        // console.log('❌ User does not have permission to modify cleaning status');
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
      // console.log(`📤 Sending request to /api/rooms/cleaning-status/${listingId}`, requestBody);
      
      const response = await fetch(`/api/rooms/cleaning-status/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      // console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      // console.log(`📦 Response data:`, data);
      
      if (data.success) {
        // console.log(`✅ Successfully updated cleaning status for listing ${listingId}`);
        
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
      // console.log('🏥 Testing Room API health...');
      const response = await fetch(API_ENDPOINTS.ROOMS_HEALTH);
      const data = await response.json();
      // console.log('🏥 Health check result:', data);
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

  // Animation keyframes for enhanced effects
  const animationStyles = `
    @keyframes slideUpFadeIn {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-8px);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
      }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 0.6;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
      }
      40%, 43% {
        transform: translate3d(0, -8px, 0);
      }
      70% {
        transform: translate3d(0, -4px, 0);
      }
      90% {
        transform: translate3d(0, -2px, 0);
      }
    }
    
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(124, 58, 237, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(124, 58, 237, 0.6), 0 0 30px rgba(124, 58, 237, 0.4);
      }
    }
    
    @keyframes heartbeat {
      0%, 100% {
        transform: scale(1);
      }
      14% {
        transform: scale(1.1);
      }
      28% {
        transform: scale(1);
      }
      42% {
        transform: scale(1.1);
      }
      70% {
        transform: scale(1);
      }
    }
  `;
  
  // Handle card click with ripple effect
  const handleCardClickWithRipple = (event, listing) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRippleEffect({ active: true, x, y });
    
    setTimeout(() => {
      setRippleEffect({ active: false, x: 0, y: 0 });
      handleCardFocus(listing);
    }, 300);
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
        // console.log('✅ Both room listings and occupancy data loaded');
        setLoading(false);
        setOccupancyLoading(false);
        
        // Trigger staggered card animations
        setTimeout(() => {
          setCardsLoaded(true);
        }, 300);
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
            sx={{
              background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              animation: 'shimmer 2s linear infinite'
            }}
          >
            <CircularProgress 
              sx={{ 
                mb: 2,
                animation: 'pulse 2s ease-in-out infinite',
                '& .MuiCircularProgress-circle': {
                  stroke: 'url(#gradient)',
                }
              }} 
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <MDTypography 
              variant="h6" 
              color="text.secondary" 
              textAlign="center"
              sx={{
                animation: 'bounce 2s ease-in-out infinite',
                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Loading...
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
            <MDBox display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={{ xs: 2, md: 0 }} mb={4}>
              <MDBox>
                <MDTypography variant="h4" fontWeight="bold" sx={{ 
                  background: 'linear-gradient(135deg, #4F7CFF 0%, #3B82F6 50%, #2563EB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '1.75rem',
                  letterSpacing: '-0.025em',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  mb: 0.5
                }}>
                  🏢 Apartment Management
                </MDTypography>
              </MDBox>
              
              {/* Enhanced Search Bar with Animation */}
              <MDBox sx={{ minWidth: { xs: '100%', md: '320px' } }}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Search apartments, guests, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ 
                          color: '#4F7CFF', 
                          fontSize: '1.2rem',
                          animation: searchTerm ? 'pulse 2s infinite' : 'none'
                        }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      position: 'relative',
                      overflow: 'hidden',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(124, 58, 237, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px) scale(1.02)',
                        backgroundColor: '#ffffff',
                        animation: 'glow 2s ease-in-out infinite alternate'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 8px 25px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)',
                        transform: 'translateY(-2px) scale(1.02)',
                        backgroundColor: '#ffffff',
                        animation: 'glow 1.5s ease-in-out infinite alternate'
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent)',
                        transition: 'left 0.5s ease-in-out',
                      },
                      '&:hover::before': {
                        left: '100%',
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px 12px 8px',
                    },
                  }}
                />
              </MDBox>
            </MDBox>
            
            {/* Add animation styles */}
            <style>{animationStyles}</style>
            
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              {/* Desktop Grid View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{
                  display: focusedCard ? 'flex' : 'grid',
                  gridTemplateColumns: focusedCard ? 'none' : 'repeat(auto-fill, minmax(350px, 1fr))',
                  justifyContent: focusedCard ? 'center' : 'initial',
                  alignItems: focusedCard ? 'center' : 'initial',
                  gap: 2,
                  width: '100%',
                  minHeight: focusedCard ? '60vh' : 'auto',
                  position: 'relative'
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
                        data-listing-id={listing.id}
                        onClick={(e) => handleCardClickWithRipple(e, listing)}
                        onMouseEnter={() => setHoveredCard(listing.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{
                          // Staggered animation
                          animation: cardsLoaded ? `slideUpFadeIn 0.6s ease-out ${index * 0.1}s both` : 'none',
                          // Floating animation on hover
                          '&:hover': {
                            animation: hoveredCard === listing.id ? 'float 3s ease-in-out infinite' : 'none',
                          },
                          background: 'linear-gradient(145deg, #fefefe 0%, #fafafa 100%)',
                          borderRadius: focusedCard?.id === listing.id ? '16px' : '12px',
                          p: 0,
                          border: focusedCard?.id === listing.id ? '1px solid #f8fafc' : '1px solid #f8fafc',
                          boxShadow: focusedCard?.id === listing.id 
                            ? '0 12px 24px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 1)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255, 255, 255, 1)',
                          minHeight: focusedCard?.id === listing.id ? '420px' : '100px',
                          maxWidth: focusedCard?.id === listing.id ? '650px' : 'none',
                          width: focusedCard?.id === listing.id ? '100%' : 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transform: focusedCard?.id === listing.id ? 'scale(1.02) translateY(-8px)' : 'scale(1)',
                          opacity: isAnimating ? 0.7 : 1,
                          zIndex: focusedCard?.id === listing.id ? 1001 : 1,
                          position: focusedCard?.id === listing.id ? 'relative' : 'static',
                          transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          overflow: 'hidden',
                          backdropFilter: 'blur(10px)',
                          // Enhanced hover effects with animations
                          '&:hover': {
                            transform: focusedCard?.id === listing.id 
                              ? 'scale(1.01) translateY(-2px)' 
                              : 'scale(1.005) translateY(-1px)',
                            boxShadow: focusedCard?.id === listing.id 
                              ? '0 8px 16px rgba(221, 214, 254, 0.15), 0 4px 8px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 1)' 
                              : '0 4px 12px rgba(221, 214, 254, 0.1), 0 2px 6px rgba(0, 0, 0, 0.015), inset 0 1px 0 rgba(255, 255, 255, 1)',
                            border: focusedCard?.id === listing.id ? '1px solid #f3f4f6' : '1px solid #f9fafb',
                            filter: 'brightness(1.005) saturate(1.01)',
                            background: 'linear-gradient(145deg, #ffffff 0%, #fcfcfc 100%)',
                          },
                          // Ripple effect
                          '&::before': rippleEffect.active && hoveredCard === listing.id ? {
                            content: '""',
                            position: 'absolute',
                            top: rippleEffect.y,
                            left: rippleEffect.x,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(124, 58, 237, 0.3)',
                            transform: 'translate(-50%, -50%)',
                            animation: 'ripple 0.6s linear',
                            zIndex: 1000,
                          } : {}
                        }}
                      >
                        {/* Enhanced Apartment Header */}
                        <MDBox sx={{ 
                          background: `linear-gradient(135deg, ${
                            listing.reservationStatus === 'Upcoming Stay' ? getStatusColor('reservation', 'Upcoming Stay') : 
                            listing.reservationStatus === 'Checked In' ? getStatusColor('reservation', 'Checked In') : 
                            (listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Staying Guest') ? getStatusColor('reservation', 'Staying Guest') : 
                            (listing.guestName === 'N/A' || !listing.guestName || listing.reservationStatus === 'N/A') ? '#E2E8F0' : 
                            getStatusColor('activity', listing.activity)
                          } 0%, ${
                            listing.reservationStatus === 'Upcoming Stay' ? '#6D28D9' : 
                            listing.reservationStatus === 'Checked In' ? '#047857' : 
                            (listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Staying Guest') ? '#4B5563' : 
                            (listing.guestName === 'N/A' || !listing.guestName || listing.reservationStatus === 'N/A') ? '#CBD5E1' : 
                            '#374151'
                          } 100%)`,
                          color: 'white',
                          p: 1.5,
                          textAlign: 'center',
                          position: 'relative',
                          borderRadius: '12px 12px 0 0',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}>
                          <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
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

                      {/* Compact Apartment Details */}
                      <MDBox sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1 }}>
                        {/* Guest Information */}
                        {listing.guestName && listing.guestName !== 'N/A' && (
                          <MDBox sx={{ mb: 0.5 }}>
                            <MDTypography variant="body2" sx={{ 
                              color: '#6366f1', 
                              fontSize: '0.75rem', 
                              fontWeight: 500,
                              mb: 0.5,
                              textTransform: 'uppercase',
                              letterSpacing: '0.8px'
                            }}>
                              Guest
                            </MDTypography>
                            <MDTypography variant="body1" sx={{ 
                              color: '#1e293b', 
                              fontSize: '0.9rem', 
                              fontWeight: 600,
                              lineHeight: 1.2
                            }}>
                              {listing.guestName}
                            </MDTypography>
                          </MDBox>
                        )}

                        {/* Dates Information */}
                        {listing.checkInDate && listing.checkInDate !== 'N/A' && listing.checkOutDate && listing.checkOutDate !== 'N/A' && (
                          <MDBox sx={{ mb: 0.5 }}>
                            <MDTypography variant="body2" sx={{ 
                              color: '#6366f1', 
                              fontSize: '0.75rem', 
                              fontWeight: 500,
                              mb: 0.5,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Stay Period
                            </MDTypography>
                            <MDTypography variant="body1" sx={{ 
                              color: '#475569', 
                              fontSize: '0.85rem', 
                              fontWeight: 600
                            }}>
                              {listing.checkInDate} - {listing.checkOutDate}
                            </MDTypography>
                          </MDBox>
                        )}

                          {/* Reservation ID */}
                          {listing.reservationId && listing.reservationId !== 'N/A' && (
                            <MDBox sx={{ mb: 0.5 }}>
                              <MDTypography variant="body2" sx={{ 
                                color: '#64748b', 
                                fontSize: '0.75rem', 
                                fontWeight: 500,
                                mb: 0.3,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Reservation ID
                              </MDTypography>
                              <MDTypography variant="body1" sx={{ 
                                color: '#475569', 
                                fontSize: '0.85rem', 
                                fontWeight: 600,
                                fontFamily: 'monospace'
                              }}>
                                {listing.reservationId}
                              </MDTypography>
                            </MDBox>
                          )}

                          {/* Reservation Status */}
                          {listing.reservationStatus && listing.reservationStatus !== 'N/A' && (
                            <MDBox sx={{ mb: 0.5 }}>
                              <MDTypography variant="body2" sx={{ 
                                color: '#64748b', 
                                fontSize: '0.75rem', 
                                fontWeight: 500,
                                mb: 1,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Status
                              </MDTypography>
                              <MDBox sx={{
                                display: 'inline-block',
                                px: 2,
                                py: 1,
                                borderRadius: '8px',
                                backgroundColor: getStatusColor('reservation', listing.reservationStatus),
                                color: 'white'
                              }}>
                                <MDTypography variant="body2" sx={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: 600
                                }}>
                                  {listing.reservationStatus}
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          )}

                          {/* Activity Status */}
                          <MDBox sx={{ mb: 3 }}>
                            <MDTypography variant="body2" sx={{ 
                              color: '#64748b', 
                              fontSize: '0.75rem', 
                              fontWeight: 500,
                              mb: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Activity
                            </MDTypography>
                            <MDBox sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              backgroundColor: getStatusColor('activity', listing.activity),
                              color: 'white'
                            }}>
                              <MDTypography variant="body2" sx={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 600
                              }}>
                                {listing.activity || 'Unknown'}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                          
                          {/* Clean Status Section */}
                          <MDBox sx={{ mt: 'auto' }}>
                            {/* Cleaning Status */}
                            <MDBox sx={{ mb: 2 }}>
                              <MDTypography variant="body2" sx={{ 
                                color: '#6366f1', 
                                fontSize: '0.7rem', 
                                fontWeight: 700,
                                mb: 0.8,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px'
                              }}>
                                Cleaning Status
                              </MDTypography>
                              <MDBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {/* Enhanced HA Status Button with Animations */}
                                <MDBox 
                                  onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HA')}
                                  sx={{
                                    flex: 1,
                                    background: `linear-gradient(135deg, ${getStatusColor('hw', listing.hwStatus)} 0%, ${
                                      listing.hwStatus === 'Clean' ? '#0E7490' : '#EA580C'
                                    } 100%)`,
                                    color: 'white',
                                    px: 1.5,
                                    py: 0.5,
                                    minHeight: '35px',
                                    borderRadius: '8px',
                                    cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    boxShadow: `0 4px 15px ${getStatusColor('hw', listing.hwStatus)}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    // Pulse animation for interactive buttons
                                    animation: !(isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) ? 'heartbeat 3s ease-in-out infinite' : 'none',
                                    '&:hover': {
                                      transform: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : 'translateY(-1px) scale(1.02)',
                                      boxShadow: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : `0 4px 12px ${getStatusColor('hw', listing.hwStatus)}40, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                                      filter: 'brightness(1.08) saturate(1.1)',
                                    },
                                    // Shimmer effect
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: '-100%',
                                      width: '100%',
                                      height: '100%',
                                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                      transition: 'left 0.5s ease-in-out',
                                    },
                                    '&:hover::before': {
                                      left: '100%',
                                    }
                                  }}
                                >
                                  <MDTypography variant="body2" sx={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 600,
                                    color: 'white',
                                    textAlign: 'center',
                                    lineHeight: 1.3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                  }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>HA</span>
                                    <span style={{ fontSize: '1rem' }}>
                                      {listing.hwStatus === 'Clean' ? '✓' : '⚠'}
                                    </span>
                                    <span style={{ fontSize: '1rem' }}>{listing.hwStatus === 'Clean' ? 'Clean' : 'Not Clean'}</span>
                                  </MDTypography>
                                </MDBox>

                                {/* Enhanced HK Status Button with Animations */}
                                <MDBox 
                                  onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HK')}
                                  sx={{
                                    flex: 1,
                                    background: `linear-gradient(135deg, ${getStatusColor('hk', listing.hkStatus)} 0%, ${
                                      listing.hkStatus === 'Clean' ? '#C2410C' : '#BE185D'
                                    } 100%)`,
                                    color: 'white',
                                    px: 1.5,
                                    py: 0.5,
                                    minHeight: '35px',
                                    borderRadius: '8px',
                                    cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    boxShadow: `0 4px 15px ${getStatusColor('hk', listing.hkStatus)}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    // Pulse animation for interactive buttons (delayed)
                                    animation: !(isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) ? 'heartbeat 3s ease-in-out infinite 1.5s' : 'none',
                                    '&:hover': {
                                      transform: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : 'translateY(-1px) scale(1.02)',
                                      boxShadow: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : `0 4px 12px ${getStatusColor('hk', listing.hkStatus)}40, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                                      filter: 'brightness(1.08) saturate(1.1)',
                                    },
                                    // Shimmer effect
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: '-100%',
                                      width: '100%',
                                      height: '100%',
                                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                      transition: 'left 0.5s ease-in-out',
                                    },
                                    '&:hover::before': {
                                      left: '100%',
                                    }
                                  }}
                                >
                                  <MDTypography variant="body2" sx={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 600,
                                    color: 'white',
                                    textAlign: 'center',
                                    lineHeight: 1.3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                  }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>HK</span>
                                    <span style={{ fontSize: '1rem' }}>
                                      {listing.hkStatus === 'Clean' ? '✓' : '⚠'}
                                    </span>
                                    <span style={{ fontSize: '1rem' }}>{listing.hkStatus === 'Clean' ? 'Clean' : 'Not Clean'}</span>
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
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
                        border: '1px solid #e0e0e0',
                        // Mobile card animations
                        animation: cardsLoaded ? `slideUpFadeIn 0.5s ease-out ${index * 0.08}s both` : 'none',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 8px 25px rgba(124, 58, 237, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08)',
                          border: '1px solid #7C3AED'
                        }
                      }}
                    >
                      {/* Header with Listing Name and Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <MDTypography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem' }}>
                          {listing.name || 'No Name Available'}
                        </MDTypography>
                        {/* Mobile HA and HK Status */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={`HA: ${listing.hwStatus || 'Not Clean'}`}
                            size="small"
                            onClick={isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? undefined : (e) => handleStatusClick(e, listing, 'HA')}
                            sx={{ 
                              fontSize: '0.7rem', 
                              height: '24px',
                              fontWeight: 'bold',
                              backgroundColor: getStatusColor('hw', listing.hwStatus),
                              color: '#000000',
                              border: '1px solid #e2e8f0',
                              cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              animation: !(isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) ? 'pulse 4s ease-in-out infinite' : 'none',
                              '&:hover': {
                                transform: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : 'scale(1.1) translateY(-1px)',
                                boxShadow: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : `0 4px 12px ${getStatusColor('hw', listing.hwStatus)}40`
                              }
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
                              cursor: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'default' : 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              animation: !(isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete'))) ? 'pulse 4s ease-in-out infinite 2s' : 'none',
                              '&:hover': {
                                transform: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : 'scale(1.1) translateY(-1px)',
                                boxShadow: isViewOnly() || (isCustom() && !hasPermission('rooms', 'complete')) ? 'none' : `0 4px 12px ${getStatusColor('hk', listing.hkStatus)}40`
                              }
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
                          <MDTypography variant="body2" color="text.primary" sx={{ textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%', fontSize: '0.85rem' }}>
                            {listing.guestName || 'N/A'}
                          </MDTypography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          minHeight: '32px'
                        }}>
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
                              backgroundColor: getStatusColor('reservation', listing.reservationStatus),
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          minHeight: '32px'
                        }}>
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
                              backgroundColor: listing.reservationStatus === 'Upcoming Stay' ? '#8B5CF6' : 
                                               listing.reservationStatus === 'Checked In' ? '#22C55E' : 
                                               (listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Staying Guest') ? '#6B7280' : 
                                               (listing.guestName === 'N/A' || !listing.guestName || listing.reservationStatus === 'N/A') ? '#F8BBD0' : 
                                               getStatusColor('activity', listing.activity),
                              color: '#000000',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
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

      {/* Daily Occupancy & Revenue Report - Redesigned Layout */}
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
            {/* Header */}
            <MDBox sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '2px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <MDTypography variant="h4" color="text.primary" mb={1} fontWeight="bold" sx={{ 
                color: '#1e293b',
                fontSize: '1.8rem'
              }}>
                📊 Daily Occupancy & Revenue Report
              </MDTypography>
              
            </MDBox>
            
            {/* Report Period and Occupancy Rate */}
            <MDBox sx={{ 
              backgroundColor: '#f8fafc',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '1px solid #e2e8f0'
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDBox sx={{ 
                    backgroundColor: '#e0f2fe',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid #b3e5fc',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <MDTypography variant="body1" color="text.primary" sx={{ 
                      color: '#0277bd', 
                      fontWeight: 'bold',
                      mb: 1,
                      fontSize: '0.9rem'
                    }}>
                      🕒 Report Period
                    </MDTypography>
                    <MDTypography variant="h6" color="text.primary" sx={{ 
                      color: '#01579b', 
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {occupancyData.reportDate}, 12:00 AM - {occupancyData.reportTime}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox sx={{ 
                    backgroundColor: '#e8f5e8',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid #c8e6c9',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <MDTypography variant="body1" color="text.primary" sx={{ 
                      color: '#2e7d32', 
                      fontWeight: 'bold',
                      mb: 1,
                      fontSize: '0.9rem'
                    }}>
                      📈 Occupancy Rate
                    </MDTypography>
                    <MDTypography variant="h6" color="text.primary" sx={{ 
                      color: '#1b5e20', 
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {occupancyData.occupancyRate}% ({occupancyData.totalReserved}/{occupancyData.totalRooms})
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            {/* Room Availability & Cleaning Status */}
            <MDBox sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '1px solid #e2e8f0'
            }}>
              <MDBox sx={{ 
                backgroundColor: '#f0f9ff',
                borderRadius: 2,
                p: 2,
                mb: 3,
                border: '1px solid #bae6fd',
                textAlign: 'center'
              }}>
                <MDTypography variant="h5" color="text.primary" fontWeight="bold" sx={{ 
                  color: '#0369a1',
                  fontSize: '1.2rem'
                }}>
                  🏨 Room Availability & Cleaning Status
                </MDTypography>
              </MDBox>
            
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
                        borderRadius: 2, 
                        p: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        minHeight: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          border: '1px solid #cbd5e1',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <MDBox textAlign="center">
                        <MDBox sx={{ 
                          backgroundColor: '#ffffff',
                          borderRadius: 1,
                          p: 1,
                          mb: 2,
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                        }}>
                          <MDTypography variant="h6" fontWeight="bold" sx={{ 
                            color: '#1e293b',
                            fontSize: '0.9rem'
                          }}>
                            {roomType} {isExpanded ? '▼' : '▶'}
                          </MDTypography>
                        </MDBox>
                        
                        <MDBox sx={{ 
                          backgroundColor: '#ffffff',
                          borderRadius: 1,
                          p: 1.5,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <MDTypography variant="body2" sx={{ 
                            lineHeight: 1.4,
                            color: '#475569',
                            fontWeight: 'medium',
                            fontSize: '0.8rem'
                          }}>
                            Available: <strong style={{ color: '#059669' }}>{data.available}</strong>
                          </MDTypography>
                          <MDTypography variant="body2" sx={{ 
                            lineHeight: 1.4,
                            color: '#475569',
                            fontWeight: 'medium',
                            mt: 0.5,
                            fontSize: '0.8rem'
                          }}>
                            Occupied: <strong style={{ color: '#dc2626' }}>{data.reserved}</strong>
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
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          p: 2,
                          mb: 3,
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                                  backgroundColor: listing.reservationStatus === 'Upcoming Stay' ? '#8B5CF6' : 
                                                   listing.reservationStatus === 'Checked In' ? '#22C55E' : 
                                                   (listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Staying Guest') ? '#6B7280' : 
                                                   (listing.guestName === 'N/A' || !listing.guestName || listing.reservationStatus === 'N/A') ? '#F8BBD0' : 
                                                   getStatusColor('activity', listing.activity),
                                  borderRadius: 1,
                                  p: 1.5,
                                  mb: 2,
                                  border: '1px solid #f1f5f9',
                                  textAlign: 'left'
                                }}>
                                  <MDTypography variant="h6" fontWeight="bold" sx={{ 
                                    color: 'white',
                                    fontSize: '1rem',
                                    mb: 0
                                  }}>
                                    {listing.name || 'Unknown Apartment'}
                                  </MDTypography>
                                </MDBox>

                                {/* Content in Rows */}
                                <MDBox sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  
                                  {/* Status Row */}
                                  <MDBox sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    backgroundColor: '#ffffff',
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid #f1f5f9',
                                    minHeight: '48px'
                                  }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: '#ffffff',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px',
                                        border: '1px solid #e2e8f0'
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
                                        height: '24px',
                                        backgroundColor: listing.reservationStatus === 'Upcoming Stay' ? '#8B5CF6' : 
                                                         listing.reservationStatus === 'Checked In' ? '#22C55E' : 
                                                         (listing.reservationStatus === 'Current Stay' || listing.reservationStatus === 'Staying Guest') ? '#6B7280' : 
                                                         (listing.guestName === 'N/A' || !listing.guestName || listing.reservationStatus === 'N/A') ? '#F8BBD0' : 
                                                         getStatusColor('activity', listing.activity),
                                        color: '#000000',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    />
                                  </MDBox>

                                  {/* Guest Row */}
                                  <MDBox sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    backgroundColor: '#ffffff',
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid #f1f5f9'
                                  }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: '#ffffff',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px',
                                        border: '1px solid #e2e8f0'
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

                                  {/* HA Status Row */}
                                  <MDBox sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    backgroundColor: '#ffffff',
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid #f1f5f9'
                                  }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: '#ffffff',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px',
                                        border: '1px solid #e2e8f0'
                                      }}>
                                        <MDTypography sx={{ fontSize: '0.7rem' }}>🧹</MDTypography>
                                      </MDBox>
                                      <MDTypography variant="body2" sx={{ 
                                        color: '#475569',
                                        fontWeight: 'medium',
                                        minWidth: '60px'
                                      }}>
                                        HA:
                                      </MDTypography>
                                    </MDBox>
                                    <Chip
                                      label={listing.hwStatus || 'Not Clean'}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: getStatusColor('hw', listing.hwStatus),
                                        color: '#000000',
                                        border: '1px solid #e2e8f0'
                                      }}
                                    />
                                  </MDBox>

                                  {/* HK Status Row */}
                                  <MDBox sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    backgroundColor: '#ffffff',
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid #f1f5f9'
                                  }}>
                                    <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MDBox sx={{ 
                                        backgroundColor: '#ffffff',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        height: '24px',
                                        border: '1px solid #e2e8f0'
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
                                        backgroundColor: getStatusColor('hk', listing.hkStatus),
                                        color: '#000000',
                                        border: '1px solid #e2e8f0'
                                      }}
                                    />
                                  </MDBox>

                                  {/* Check-in Row - Only show if exists */}
                                  {listing.checkInDate && (
                                    <MDBox sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between',
                                      backgroundColor: '#ffffff',
                                      p: 1.5,
                                      borderRadius: 1,
                                      border: '1px solid #f1f5f9'
                                    }}>
                                      <MDBox sx={{ display: 'flex', alignItems: 'center' }}>
                                        <MDBox sx={{ 
                                          backgroundColor: '#ffffff',
                                          borderRadius: '50%',
                                          p: 0.5,
                                          mr: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          minWidth: '24px',
                                          height: '24px',
                                          border: '1px solid #e2e8f0'
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
                                backgroundColor: '#ffffff',
                                borderRadius: 2,
                                textAlign: 'center',
                                border: '2px solid #e2e8f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                              }}
                            >
                              <MDTypography variant="body2" sx={{ 
                                color: '#64748b',
                                fontWeight: 'medium',
                                mb: 2
                              }}>
                                📭 No {roomType} apartments found in current listings
                              </MDTypography>
                              
                              {roomType === 'Studio' && (
                                <MDBox sx={{
                                  backgroundColor: '#fef3c7',
                                  borderRadius: 1,
                                  p: 2,
                                  mb: 2,
                                  border: '1px solid #f59e0b'
                                }}>
                                  <MDTypography variant="caption" sx={{ 
                                    color: '#92400e',
                                    fontWeight: 'bold',
                                    display: 'block',
                                    mb: 1
                                  }}>
                                    ⚠️ Data Source Mismatch
                                  </MDTypography>
                                  <MDTypography variant="caption" sx={{ 
                                    color: '#92400e',
                                    display: 'block',
                                    lineHeight: 1.4
                                  }}>
                                    Occupancy data shows Studio apartments exist in Hostaway, but they're not available in the Teable listings database. This may indicate a data synchronization issue.
                                  </MDTypography>
                                </MDBox>
                              )}
                              
                              <MDTypography variant="caption" sx={{ 
                                color: '#94a3b8', 
                                display: 'block', 
                                mt: 1,
                                fontWeight: 'medium'
                              }}>
                                Total listings available: {listings.length}
                              </MDTypography>
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
      
      {/* Enhanced Status Update Dropdown Menu with Animations */}
      <Menu
        key={`status-menu-${selectedListing?.id}-${selectedStatusType}`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionProps={{
          timeout: 400,
        }}
        PaperProps={{
          sx: {
            boxShadow: '0 12px 40px rgba(124, 58, 237, 0.15), 0 4px 16px rgba(0,0,0,0.08)',
            borderRadius: '16px',
            mt: 1,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(124, 58, 237, 0.1)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUpFadeIn 0.3s ease-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #7C3AED, #3B82F6, #059669)',
              animation: 'shimmer 2s linear infinite'
            }
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
            py: 1.5,
            px: 2,
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#059669',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              transform: 'translateX(4px)',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
            },
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
