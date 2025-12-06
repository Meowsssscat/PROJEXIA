const Notification = require('../models/Notification');

exports.getFAQsPage = async (req, res) => {
  try {
    const currentUser = req.session?.userId ? await require('../models/User').findById(req.session.userId) : null;
    
    const faqs = [
      {
        id: 1,
        category: 'Getting Started',
        question: 'How do I create an account on Projexia?',
        answer: 'To create an account, click on "Sign Up" on the landing page. Fill in your details including your full name, email, program, and year level. You\'ll receive an OTP verification code via email to confirm your account.'
      },
      {
        id: 2,
        category: 'Getting Started',
        question: 'What information do I need to sign up?',
        answer: 'You\'ll need: Full name, Email address, Password, Program (BSIT, BSCS, BSIS), Year level (1st - 4th), and for 3rd/4th year students, your specialization track (WMAD, AMG, SMP, etc.).'
      },
      {
        id: 3,
        category: 'Getting Started',
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the sign-in page. Enter your email address, and you\'ll receive an OTP code to verify your identity. After verification, you can set a new password.'
      },
      {
        id: 4,
        category: 'Projects',
        question: 'How do I upload my project?',
        answer: 'Go to the "Upload" section (requires login). Fill in your project details including name, description, program, year level, and technologies used. Upload a thumbnail image and up to 5 additional project images. Add project links (repository, demo, etc.) and submit.'
      },
      {
        id: 5,
        category: 'Projects',
        question: 'What project details are required?',
        answer: 'Required information: Project name, Description, Program, Year level, Technologies used, Thumbnail image, and optionally: GitHub repository link, Live demo link, and additional project images.'
      },
      {
        id: 6,
        category: 'Projects',
        question: 'Can I edit my project after uploading?',
        answer: 'Yes! Go to your profile, find your project, and click the edit button. You can update any project details, images, or links. Changes are saved immediately.'
      },
      {
        id: 7,
        category: 'Projects',
        question: 'How do I delete my project?',
        answer: 'Navigate to your project details page and click the delete button. Confirm the deletion. Once deleted, the project cannot be recovered, but you can upload it again later.'
      },
      {
        id: 8,
        category: 'Browsing & Discovery',
        question: 'How can I browse projects?',
        answer: 'Visit the "Browse" section to see all projects from the community. You can filter by program, year level, and specialization track to find relevant projects.'
      },
      {
        id: 9,
        category: 'Browsing & Discovery',
        question: 'What are filters and how do I use them?',
        answer: 'Filters help you narrow down projects by Program, Year Level, and Specialization Track. Select your preferred filters, and the project list will update to show only matching projects.'
      },
      {
        id: 10,
        category: 'Browsing & Discovery',
        question: 'Can I search for specific projects?',
        answer: 'Yes! Use the search feature to find projects by name or keywords. The search works across all project titles and descriptions.'
      },
      {
        id: 11,
        category: 'Interactions',
        question: 'How do I like a project?',
        answer: 'Click the heart icon on any project card or project detail page to like it. Your like will be counted, and you can see who has liked the project (if you\'re the project owner).'
      },
      {
        id: 12,
        category: 'Interactions',
        question: 'How do I comment on a project?',
        answer: 'Scroll to the comments section on the project detail page. Enter your comment and click "Post". You can see replies from other users and the project owner.'
      },
      {
        id: 13,
        category: 'Interactions',
        question: 'Can I delete my comments?',
        answer: 'Yes! Click the delete button next to your comment to remove it. Only your own comments can be deleted.'
      },
      {
        id: 14,
        category: 'Profile',
        question: 'How do I customize my profile?',
        answer: 'Go to your profile and click "Edit Profile". You can update your bio, add social links (GitHub, LinkedIn, Portfolio), upload a profile picture, and manage your project visibility.'
      },
      {
        id: 15,
        category: 'Profile',
        question: 'Can I see who viewed my profile?',
        answer: 'Yes! On your profile page, you can see statistics including the number of views, and view lists of people who liked your projects or viewed your profile.'
      },
      {
        id: 16,
        category: 'Profile',
        question: 'How do I find someone else\'s profile?',
        answer: 'Click on any user\'s name or avatar when you see it (in comments, likes, views, etc.) to visit their profile and see their projects.'
      },
      {
        id: 17,
        category: 'Features',
        question: 'What are notifications?',
        answer: 'Notifications keep you updated on interactions with your projects. You\'ll be notified when someone likes your project, comments on it, or views it (if viewing is tracked).'
      },
      {
        id: 18,
        category: 'Features',
        question: 'How do I manage my notifications?',
        answer: 'Click the notification bell icon in the navbar. You\'ll see all your recent notifications. Click on a notification to see the related project, and use the options to mark as read or delete.'
      },
      {
        id: 19,
        category: 'Features',
        question: 'What is the Home page?',
        answer: 'The Home page (for logged-in users) shows personalized recommendations. You\'ll see trending projects, projects from your batchmates, and other suggestions based on your program and year.'
      },
      {
        id: 20,
        category: 'Support',
        question: 'How do I report a problem or inappropriate content?',
        answer: 'Click the "Report Issue" button in the footer or settings. Describe the problem, and our team will review and respond to your report within 24-48 hours.'
      },
      {
        id: 21,
        category: 'Support',
        question: 'How do I contact support?',
        answer: 'You can reach our support team via email at projexiacss@gmail.com or call +63 938 640 1063. You can also use the "Report Issue" feature for specific problems.'
      },
      {
        id: 22,
        category: 'Support',
        question: 'Is there a donate option?',
        answer: 'Yes! Visit the "Donate" section to support Projexia. Your donations help us improve the platform and keep it running smoothly.'
      },
      {
        id: 23,
        category: 'Account',
        question: 'How do I delete my account?',
        answer: 'Go to Settings and scroll to the bottom. Click "Delete Account" and confirm your password. Your account and all your data will be permanently deleted. This action cannot be undone.'
      },
      {
        id: 24,
        category: 'Account',
        question: 'What happens to my projects if I delete my account?',
        answer: 'All your projects, comments, likes, and profile data will be permanently deleted from the system.'
      },
      {
        id: 25,
        category: 'Technical',
        question: 'What browsers are supported?',
        answer: 'Projexia works best on modern browsers: Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
      },
      {
        id: 26,
        category: 'Technical',
        question: 'Is Projexia mobile-friendly?',
        answer: 'Yes! Projexia is fully responsive and works great on smartphones, tablets, and desktops. All features are accessible on mobile devices.'
      }
    ];

    // Get unread notification count
    let unreadCount = 0;
    if (currentUser) {
      unreadCount = await Notification.countDocuments({
        recipientId: currentUser._id,
        isRead: false
      });
    }

    return res.render('faqs-modern', {
      faqs,
      currentUser,
      unreadCount
    });

  } catch (error) {
    console.error('Error loading FAQs page:', error);
    return res.status(500).render('error', { error: 'Failed to load FAQs page' });
  }
};
