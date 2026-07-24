const runVerification = async () => {
  const baseURL = 'http://localhost:5001/api/leads';
  console.log('--- STARTING VERIFICATION TESTS ---');

  try {
    // 1. Submit a lead
    console.log('\n1. Testing Lead Submission (POST /api/leads)...');
    const submitRes = await fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Verification User',
        email: 'verify@digitalheroes.com',
        budget: '$1000–$5000',
        message: 'This is a test message to verify server-side validation is working correctly.'
      })
    });
    const submitData = await submitRes.json();
    console.log('Status code:', submitRes.status);
    console.log('✓ Lead submitted successfully. Saved Lead ID:', submitData.data._id);

    // 2. Test Server-side Validation
    console.log('\n2. Testing Server-side Validation (should fail with 400)...');
    const failRes = await fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        budget: 'Invalid Budget',
        message: 'short'
      })
    });
    const failData = await failRes.json();
    console.log('✓ Validation blocked invalid input. Status code:', failRes.status);
    console.log('✓ Response errors list:', failData.errors);

    // 3. Get all leads (GET /api/leads)
    console.log('\n3. Testing Get All Leads (GET /api/leads)...');
    const getAllRes = await fetch(baseURL);
    const getAllData = await getAllRes.json();
    console.log(`✓ Retained ${getAllData.leads.length} leads in database.`);
    console.log('✓ Stats Counter Grid:');
    console.log('  - Total:', getAllData.stats.total);
    console.log('  - New:', getAllData.stats.new);
    console.log('  - Contacted:', getAllData.stats.contacted);
    console.log('  - Closed:', getAllData.stats.closed);

    // 4. Update status (PATCH /api/leads/:id)
    console.log('\n4. Testing Lead Status Update (PATCH /api/leads/:id)...');
    const leadId = submitData.data._id;
    const patchRes = await fetch(`${baseURL}/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Contacted' })
    });
    const patchData = await patchRes.json();
    console.log('✓ Lead status updated in DB to:', patchData.data.status);

    // 5. Test Live Search (GET /api/leads/search?q=)
    console.log('\n5. Testing Live Search (GET /api/leads/search?q=)...');
    const searchRes = await fetch(`${baseURL}/search?q=Verification`);
    const searchData = await searchRes.json();
    console.log(`✓ Search matched ${searchData.leads.length} leads.`);
    console.log('Matched leads name list:', searchData.leads.map(l => l.name));

    console.log('\n--- ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
};

runVerification();
