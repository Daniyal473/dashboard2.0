// Debug endpoint to test Teable connection
export default async function handler(req, res) {
  try {
    console.log('🔍 Debug: Testing Teable connection...');
    
    // Check environment variables
    const teableUrl = process.env.TEABLE_BASE_URL;
    const teableToken = process.env.TEABLE_BEARER_TOKEN;
    
    console.log('Environment Variables:');
    console.log('- TEABLE_BASE_URL:', teableUrl ? 'SET' : 'NOT SET');
    console.log('- TEABLE_BEARER_TOKEN:', teableToken ? 'SET' : 'NOT SET');
    
    if (!teableUrl || !teableToken) {
      return res.status(400).json({
        success: false,
        error: 'Environment variables not set',
        teableUrl: teableUrl || 'NOT SET',
        teableToken: teableToken ? 'SET' : 'NOT SET'
      });
    }
    
    // Test simple payload
    const testPayload = {
      records: [
        {
          fields: {
            'Daily Target Actual': 'Rs400K',
            'Daily Target Achieved': 'Rs350K',
            'Date and Time ': new Date().toLocaleString('en-GB', { timeZone: 'Asia/Karachi' })
          }
        }
      ]
    };
    
    console.log('Testing Teable API with payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(teableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    
    console.log('Teable API Response:');
    console.log('- Status:', response.status);
    console.log('- Response:', responseText);
    
    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Teable connection successful!',
        status: response.status,
        response: responseText
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Teable API error',
        status: response.status,
        response: responseText,
        url: teableUrl,
        tokenPreview: teableToken.substring(0, 20) + '...'
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
