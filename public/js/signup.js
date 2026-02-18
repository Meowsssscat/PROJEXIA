// Track options based on program
const trackOptions = {
  BSIT: ['WMAD', 'AMG', 'SMP', 'NETAD'],
  BSCS: ['IS', 'GV'],
  BSIS: []
};

// DOM elements
const programSelect = document.getElementById('program');
const yearSelect = document.getElementById('year');
const trackGroup = document.getElementById('trackGroup');
const trackSelect = document.getElementById('track');
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');

// Update track field visibility and options
function updateTrackField() {
  const program = programSelect.value;
  const year = yearSelect.value;
  const isThirdOrFourthYear = year === '3rd' || year === '4th';

  // Show track field only for 3rd and 4th year students
  if (isThirdOrFourthYear && program) {
    trackGroup.style.display = 'block';
    trackSelect.required = true;
    updateTrackOptions(program);
  } else {
    trackGroup.style.display = 'none';
    trackSelect.required = false;
    trackSelect.value = '';
  }
}

// Update track options based on program
function updateTrackOptions(program) {
  const options = trackOptions[program] || [];
  
  // Clear existing options except the first one
  trackSelect.innerHTML = '<option value="">Select Track</option>';
  
  // Add program-specific options
  options.forEach(track => {
    const option = document.createElement('option');
    option.value = track;
    option.textContent = track;
    trackSelect.appendChild(option);
  });
}

// Event listeners
programSelect.addEventListener('change', updateTrackField);
yearSelect.addEventListener('change', updateTrackField);

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Messages will be shown via Toast

  // Get form data
  const formData = {
    fullName: document.getElementById('fullName').value,
    program: programSelect.value,
    year: yearSelect.value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  // Add track if required
  if (trackSelect.required && trackSelect.value) {
    formData.track = trackSelect.value;
  }

  // Validate track for 3rd and 4th year
  if ((formData.year === '3rd' || formData.year === '4th') && !formData.track) {
    Toast.error('Please select a specialization track', 'Validation Error');
    return;
  }

  // Show loading
  submitBtn.style.display = 'none';
  loading.style.display = 'block';

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      Toast.success(result.message || 'Account created successfully! Please check your email to verify your account.', 'Sign Up Successful');
      signupForm.reset();
      trackGroup.style.display = 'none';
      
      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        window.location.href = `/auth?type=verify&email=${encodeURIComponent(formData.email)}`;
      }, 2000);
    } else {
      Toast.error(result.message || 'Signup failed. Please try again.', 'Sign Up Failed');
    }
  } catch (error) {
    console.error('Signup error:', error);
    Toast.error('Network error. Please try again.', 'Connection Error');
  } finally {
    submitBtn.style.display = 'block';
    loading.style.display = 'none';
  }
});
