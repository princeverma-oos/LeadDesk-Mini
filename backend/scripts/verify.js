const runVerification = async () => {
  const baseURL = 'http://localhost:5001/api';
  console.log('--- STARTING UPGRADED VERIFICATION TESTS ---');

  try {
    // 1. Admin Login (POST /api/auth/login)
    console.log('\n1. Testing Admin Login (POST /api/auth/login)...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✓ Login successful! Status code:', loginRes.status);
    console.log('✓ JWT generated successfully.');

    // 2. Test Blocked Protected Routes (GET /api/leads should fail with 401/403 without token)
    console.log('\n2. Testing Protected Routes Protection...');
    const blockedRes = await fetch(`${baseURL}/leads`);
    console.log('  - Request leads without token status:', blockedRes.status);
    if (blockedRes.status === 401 || blockedRes.status === 403) {
      console.log('✓ Successfully blocked unauthenticated request.');
    } else {
      throw new Error('Protected route did not block unauthenticated request.');
    }

    // 3. Submit a new lead (POST /api/leads - Public)
    console.log('\n3. Testing Public Lead Submission (POST /api/leads)...');
    const submitRes = await fetch(`${baseURL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Verification User',
        email: 'verify@digitalheroes.com',
        company: 'Verification Labs',
        phone: '+1 555-9876',
        message: 'This is a test message to verify server-side validation is working correctly.'
      })
    });
    
    if (submitRes.status !== 201) {
      throw new Error(`Lead submission failed with status ${submitRes.status}`);
    }
    
    const submitData = await submitRes.json();
    console.log('Status code:', submitRes.status);
    console.log('✓ Lead submitted successfully. Saved Lead ID:', submitData.data._id);
    const leadId = submitData.data._id;

    // 4. Test Duplicate Submission Prevention (POST /api/leads - should fail with 400)
    console.log('\n4. Testing Duplicate Submission Prevention...');
    const duplicateRes = await fetch(`${baseURL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Verification User',
        email: 'verify@digitalheroes.com',
        company: 'Verification Labs',
        phone: '+1 555-9876',
        message: 'This is a test message to verify server-side validation is working correctly.'
      })
    });
    console.log('  - Duplicate submission response status:', duplicateRes.status);
    if (duplicateRes.status === 400) {
      console.log('✓ Successfully prevented duplicate submission.');
    } else {
      throw new Error('Duplicate submission was not prevented.');
    }

    // 5. Test Server-side Input Validation (POST /api/leads - should fail with 400)
    console.log('\n5. Testing Input Validation (should fail with 400)...');
    const validationRes = await fetch(`${baseURL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'bad-email',
        company: '',
        phone: '',
        message: 'short'
      })
    });
    const valData = await validationRes.json();
    console.log('  - Validation response status:', validationRes.status);
    if (validationRes.status === 400) {
      console.log('✓ Input validation blocked malformed requests.');
      console.log('  - Errors:', valData.errors);
    } else {
      throw new Error('Validation failed to block malformed request.');
    }

    // 6. Get all leads with JWT (GET /api/leads)
    console.log('\n6. Testing Get All Leads with JWT (GET /api/leads)...');
    const getAllRes = await fetch(`${baseURL}/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (getAllRes.status !== 200) {
      throw new Error(`Get all leads failed with status ${getAllRes.status}`);
    }
    
    const getAllData = await getAllRes.json();
    console.log(`✓ Fetched ${getAllData.leads.length} leads successfully.`);
    console.log('✓ Stats Grid:');
    console.log('  - Total:', getAllData.stats.total);
    console.log('  - New:', getAllData.stats.new);
    console.log('  - Contacted:', getAllData.stats.contacted);
    console.log('  - Qualified:', getAllData.stats.qualified);
    console.log('  - Closed:', getAllData.stats.closed);

    // 7. Update status with JWT (PATCH /api/leads/:id)
    console.log('\n7. Testing Lead Status Update with JWT (PATCH /api/leads/:id)...');
    const patchRes = await fetch(`${baseURL}/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Qualified' })
    });
    
    if (patchRes.status !== 200) {
      throw new Error(`Status update failed with status ${patchRes.status}`);
    }
    
    const patchData = await patchRes.json();
    console.log('✓ Lead status updated in DB to:', patchData.data.status);

    // 8. Delete lead with JWT (DELETE /api/leads/:id)
    console.log('\n8. Testing Lead Deletion with JWT (DELETE /api/leads/:id)...');
    const deleteRes = await fetch(`${baseURL}/leads/${leadId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (deleteRes.status !== 200) {
      throw new Error(`Deletion failed with status ${deleteRes.status}`);
    }
    console.log('✓ Lead deleted successfully from DB.');

    console.log('\n--- ALL UPGRADED VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
};

runVerification();
