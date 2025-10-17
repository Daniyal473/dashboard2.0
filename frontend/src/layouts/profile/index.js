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
import { useState, useEffect } from "react";

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
  const { user, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

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


  // Handle cleaning status change
  const handleCleaningStatusChange = async (listingId, newStatus) => {
    try {
      console.log(`🔄 handleCleaningStatusChange called with listingId: "${listingId}", newStatus: "${newStatus}"`);
      
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
    if (isAuthenticated && isAdmin()) {
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
  }, [isAuthenticated, isAdmin]);

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

  // Redirect non-admin users (Rooms is admin-only)
  if (!isAdmin()) {
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

      {/* Cleaning Status Management Section - Kanban View */}
      {listings.length > 0 && (
        <MDBox px={3} mb={3}>
          <Card sx={{ p: 3, backgroundColor: 'white', boxShadow: 3 }}>
            <MDTypography variant="h5" color="text.primary" mb={3} fontWeight="bold">
              🧹 Apartment Cleaning Status
            </MDTypography>
            
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              {/* Desktop Kanban View - Vertical Floor Layout */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 3,
                  width: '100%'
                }}>
                  {/* Generate floor rows G through 9F */}
                  {['G', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F'].map((floor, floorIndex) => {
                    // Filter listings for this floor
                    const floorListings = listings
                      .filter(listing => 
                        (listing.country === 'Pakistan' || 
                         listing.country === 'PK' ||
                         (listing.address && listing.address.toLowerCase().includes('pakistan')) ||
                         (listing.location && listing.location.toLowerCase().includes('pakistan')) ||
                         (listing.city && ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala'].includes(listing.city.toLowerCase()))) &&
                        listing.name && (
                          floor === 'G' 
                            ? (listing.name.toLowerCase().includes('gf') || listing.name.toLowerCase().includes('g-'))
                            : listing.name.toLowerCase().includes(floor.toLowerCase())
                        )
                      );

                    return (
                      <Box
                        key={floor}
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 3,
                          p: 3,
                          border: '2px solid #f0f0f0',
                          width: '100%',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {/* Floor Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <MDTypography 
                            variant="h4" 
                            fontWeight="bold" 
                            color="text.primary" 
                            sx={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              px: 3,
                              py: 1.5,
                              borderRadius: 3,
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                              minWidth: '100px',
                              textAlign: 'center',
                              mr: 3,
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' },
                                '50%': { boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)' },
                                '100%': { boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }
                              }
                            }}
                          >
                            {floor}
                          </MDTypography>
                          
                          {/* Floor Summary */}
                          <Box sx={{ flex: 1 }}>
                            <MDTypography variant="h6" color="text.primary" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                              {floorListings.length} apartment{floorListings.length !== 1 ? 's' : ''} on this floor
                            </MDTypography>
                          </Box>
                        </Box>

                        {/* Responsive Grid Layout for Apartments */}
                        {floorListings.length > 0 ? (
                          <Box sx={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            pb: 2,
                            justifyContent: 'flex-start',
                            alignItems: 'stretch'
                          }}>
                            {floorListings.map((listing, index) => (
                              <Card
                                key={listing.id}
                                sx={{
                                  p: 3,
                                  backgroundColor: 'white',
                                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                                  borderRadius: 3,
                                  border: '1px solid #f0f0f0',
                                  width: 'calc(25% - 12px)',
                                  minWidth: '280px',
                                  '@media (max-width: 1400px)': {
                                    width: 'calc(33.333% - 12px)'
                                  },
                                  '@media (max-width: 1024px)': {
                                    width: 'calc(50% - 12px)'
                                  },
                                  '@media (max-width: 768px)': {
                                    width: '100%'
                                  },
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  animation: `slideIn 0.6s ease-out ${index * 0.1}s both`,
                                  '@keyframes slideIn': {
                                    '0%': { 
                                      opacity: 0,
                                      transform: 'translateX(30px)'
                                    },
                                    '100%': { 
                                      opacity: 1,
                                      transform: 'translateX(0)'
                                    }
                                  },
                                  '&:hover': { 
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                    transform: 'translateY(-8px) scale(1.02)',
                                  },
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  }
                                }}
                              >
                                {/* Listing Header */}
                                <Box sx={{ mb: 2 }}>
                                  <MDTypography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                                    {listing.name || 'No Name Available'}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                                    ID: {listing.reservationId || 'N/A'}
                                  </MDTypography>
                                </Box>

                                {/* Guest Info */}
                                {listing.guestName && (
                                  <Box sx={{ mb: 1.5 }}>
                                    <MDTypography variant="body1" color="text.primary" sx={{ fontSize: '0.95rem', fontWeight: 'medium' }}>
                                      👤 {listing.guestName}
                                    </MDTypography>
                                  </Box>
                                )}

                                {/* Dates */}
                                {(listing.checkInDate || listing.checkOutDate) && (
                                  <Box sx={{ mb: 2 }}>
                                    {listing.checkInDate && (
                                      <MDTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                                        📅 Check-in: {listing.checkInDate}
                                      </MDTypography>
                                    )}
                                    {listing.checkOutDate && (
                                      <MDTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                        📅 Check-out: {listing.checkOutDate}
                                      </MDTypography>
                                    )}
                                  </Box>
                                )}

                                {/* Status Chips */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {/* Cleaning Status Dropdown */}
                                  <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                      value={listing.cleaningStatus || 'Not Clean'}
                                      onChange={(e) => handleCleaningStatusChange(listing.id, e.target.value)}
                                      disabled={updatingStatus[listing.id]}
                                      sx={{
                                        fontSize: '0.8rem',
                                        height: '32px',
                                        fontWeight: 'bold',
                                        backgroundColor: listing.cleaningStatus === 'Clean' ? '#10B981' : '#EF4444',
                                        color: '#FFFFFF',
                                        '& .MuiSelect-select': {
                                          color: '#FFFFFF',
                                          fontWeight: 'bold'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          border: 'none'
                                        },
                                        '& .MuiSelect-icon': {
                                          color: '#FFFFFF'
                                        },
                                        '&:hover': {
                                          backgroundColor: listing.cleaningStatus === 'Clean' ? '#059669' : '#DC2626'
                                        },
                                        '&.Mui-disabled': {
                                          backgroundColor: '#9CA3AF',
                                          color: '#FFFFFF'
                                        }
                                      }}
                                    >
                                      <MenuItem value="Clean" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        Clean
                                      </MenuItem>
                                      <MenuItem value="Not Clean" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        Not Clean
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                  <Chip
                                    label={listing.activity || 'Unknown'}
                                    size="medium"
                                    sx={{ 
                                      fontSize: '0.8rem', 
                                      height: '28px',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      backgroundColor: 
                                        listing.activity === 'Vacant' ? '#22C55E' : 
                                        listing.activity === 'Occupied' ? '#F59E0B' : '#6B7280',
                                      color: '#FFFFFF',
                                      '&:hover': {
                                        backgroundColor: 
                                          listing.activity === 'Vacant' ? '#16A34A' : 
                                          listing.activity === 'Occupied' ? '#D97706' : '#4B5563'
                                      }
                                    }}
                                  />
                                  {listing.reservationStatus && (
                                    <Chip
                                      label={listing.reservationStatus}
                                      size="medium"
                                      sx={{ 
                                        fontSize: '0.8rem', 
                                        height: '28px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                                  )}
                                </Box>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ 
                            textAlign: 'center', 
                            py: 6,
                            color: 'text.secondary',
                            backgroundColor: '#f8f9fa',
                            borderRadius: 3,
                            border: '2px dashed #dee2e6'
                          }}>
                            <MDTypography variant="h6" sx={{ fontSize: '1rem', opacity: 0.7 }}>
                              🏢 No apartments on this floor
                            </MDTypography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Mobile Card View - Previous Layout Restored */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {listings
                  .filter(listing => 
                    listing.country === 'Pakistan' || 
                    listing.country === 'PK' ||
                    (listing.address && listing.address.toLowerCase().includes('pakistan')) ||
                    (listing.location && listing.location.toLowerCase().includes('pakistan')) ||
                    (listing.city && ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala'].includes(listing.city.toLowerCase()))
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
                        {/* Mobile Cleaning Status Dropdown */}
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={listing.cleaningStatus || 'Not Clean'}
                            onChange={(e) => handleCleaningStatusChange(listing.id, e.target.value)}
                            disabled={updatingStatus[listing.id]}
                            sx={{
                              fontSize: '0.75rem',
                              height: '28px',
                              fontWeight: 'bold',
                              backgroundColor: listing.cleaningStatus === 'Clean' ? '#10B981' : '#EF4444',
                              color: '#FFFFFF',
                              '& .MuiSelect-select': {
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                padding: '4px 8px'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                              },
                              '& .MuiSelect-icon': {
                                color: '#FFFFFF'
                              },
                              '&:hover': {
                                backgroundColor: listing.cleaningStatus === 'Clean' ? '#059669' : '#DC2626'
                              },
                              '&.Mui-disabled': {
                                backgroundColor: '#9CA3AF',
                                color: '#FFFFFF'
                              }
                            }}
                          >
                            <MenuItem value="Clean" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                              Clean
                            </MenuItem>
                            <MenuItem value="Not Clean" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                              Not Clean
                            </MenuItem>
                          </Select>
                        </FormControl>
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
                              backgroundColor: 
                                listing.activity === 'Vacant' ? '#22C55E' : 
                                listing.activity === 'Occupied' ? '#F59E0B' : '#6B7280',
                              color: '#FFFFFF',
                              '&:hover': {
                                backgroundColor: 
                                  listing.activity === 'Vacant' ? '#16A34A' : 
                                  listing.activity === 'Occupied' ? '#D97706' : '#4B5563'
                              }
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

      {/* Occupancy Data Display - Only show when both data sets are loaded */}
      {occupancyData && !loading && !occupancyLoading && (
        <MDBox px={3} mb={3}>
          <Card sx={{ p: 3, mb: 2, backgroundColor: 'white', boxShadow: 3 }}>
            <MDTypography variant="h5" color="text.primary" mb={2} fontWeight="bold">
              Daily Occupancy & Revenue Report ({occupancyData.reportDate})
            </MDTypography>
            
            <MDBox display="flex" flexDirection="column" gap={1} mb={2}>
              <MDTypography variant="body1" color="text.primary">
                🕒 Report Period: {occupancyData.reportDate}, 12:00 AM - {occupancyData.reportTime}
              </MDTypography>
              <MDTypography variant="body1" color="text.primary" fontWeight="bold">
                📈 Occupancy Rate: {occupancyData.occupancyRate}% (Reserved: {occupancyData.totalReserved} / Total: {occupancyData.totalRooms})
              </MDTypography>
            </MDBox>

            <MDTypography variant="h6" color="text.primary" mb={1} fontWeight="bold">
              🏨 Room Availability & Cleaning Status:
            </MDTypography>
            
            <Grid container spacing={2}>
              {['Studio', '1BR', '2BR', '2BR Premium', '3BR'].map((roomType) => {
                const data = occupancyData.roomTypes?.[roomType] || { available: 0, reserved: 0, total: 0 };
                return (
                <Grid item xs={12} sm={6} md={2.4} key={roomType}>
                  <Card 
                    sx={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      p: 2.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      border: '1px solid #e0e0e0',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <MDBox textAlign="center">
                      <MDTypography variant="h6" color="text.primary" fontWeight="bold" mb={1.5}>
                        {roomType}
                      </MDTypography>
                      
                      <MDTypography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Available: <strong style={{ color: '#2e7d32' }}>{data.available}</strong> | Reserved: <strong style={{ color: '#d32f2f' }}>{data.reserved}</strong>
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                );
              })}
            </Grid>
            
          </Card>

          {/* Occupancy Bar Chart */}
          <Card sx={{ p: 3, backgroundColor: 'white', boxShadow: 3 }}>
            <MDTypography variant="h6" color="text.primary" mb={3} fontWeight="bold">
              📊 Current Occupancy by Room Type
            </MDTypography>
            
            <MDBox sx={{ height: '400px', width: '100%' }}>
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

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
