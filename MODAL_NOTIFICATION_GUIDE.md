# Modal & Notification System - Developer Guide

## Quick Start

### Including in Your HTML
```html
<!-- Load the design system first -->
<link rel="stylesheet" href="/css/projexia-design-system.css" />

<!-- Load modal styles -->
<link rel="stylesheet" href="/css/modal-modern.css" />

<!-- Load modal script -->
<script src="/js/modal.js"></script>

<!-- Load notification script -->
<script src="/js/notification.js"></script>
```

---

## Modal System API

### Basic Usage

#### Alert Dialog
```javascript
await Modal.alert('This is a message', 'Title', 'info');
// Returns: Promise<void>
```

**Types**: 'info', 'success', 'error', 'warning', 'confirm'

#### Confirmation Dialog
```javascript
const confirmed = await Modal.confirm(
  'Are you sure you want to delete?',
  'Confirm Delete',
  'Delete',
  'Cancel'
);
// Returns: Promise<boolean> - true if confirmed, false if cancelled
```

#### Success Message
```javascript
await Modal.success('Your changes have been saved!', 'Success');
// Returns: Promise<void>
```

#### Error Message
```javascript
await Modal.error('Failed to save changes', 'Error');
// Returns: Promise<void>
```

#### Warning Message
```javascript
await Modal.warning('Please verify your email', 'Verification Required');
// Returns: Promise<void>
```

#### Info Message
```javascript
await Modal.info('A new version is available', 'Update Available');
// Returns: Promise<void>
```

#### Prompt for Input
```javascript
const userInput = await Modal.prompt(
  'Enter your name:',
  'User Name',
  'John Doe',    // default value (optional)
  'text'         // input type (optional)
);
// Returns: Promise<string|null> - input value or null if cancelled
```

#### Custom Modal
```javascript
const result = await Modal.show({
  type: 'info',
  title: 'Custom Modal',
  message: 'This is a custom modal',
  buttons: [
    { label: 'Cancel', type: 'secondary' },
    { label: 'OK', type: 'primary' }
  ]
});
// Returns: Promise<{action: number, ...}>
```

---

## Notification System API

### Basic Usage

#### Success Notification
```javascript
Notification.success('Success', 'Operation completed successfully!');
// Toast auto-dismisses after 4 seconds
```

#### Error Notification
```javascript
Notification.error('Error', 'Something went wrong. Please try again.');
```

#### Warning Notification
```javascript
Notification.warning('Warning', 'This action cannot be undone.');
```

#### Info Notification
```javascript
Notification.info('Info', 'Please note the new update.');
```

#### Custom Notification
```javascript
Notification.show('success', 'Title', 'Message', {
  duration: 5000,  // milliseconds (0 = no auto-dismiss)
  icon: '✓',       // custom icon
  action: () => {} // optional callback
});
```

#### Dismiss All Notifications
```javascript
Notification.dismissAll();
```

---

## Real-World Examples

### Form Submission
```javascript
async function handleFormSubmit(e) {
  e.preventDefault();
  
  try {
    const formData = new FormData(this);
    const response = await fetch('/api/save', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      await Modal.success('Changes saved successfully', 'Success');
      // Optionally reload page or update UI
    } else {
      const error = await response.json();
      await Modal.error(error.message, 'Error');
    }
  } catch (error) {
    await Modal.error('An unexpected error occurred', 'Error');
    console.error(error);
  }
}
```

### Delete Confirmation
```javascript
async function handleDelete(id) {
  const confirmed = await Modal.confirm(
    'This action cannot be undone. Are you sure?',
    'Delete Item',
    'Delete',
    'Cancel'
  );
  
  if (!confirmed) return;
  
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      Notification.success('Deleted', 'Item deleted successfully');
      // Remove from UI
    } else {
      Notification.error('Error', 'Failed to delete item');
    }
  } catch (error) {
    Notification.error('Error', 'An error occurred');
  }
}
```

### User Registration
```javascript
async function registerUser() {
  const email = await Modal.prompt(
    'Enter your email:',
    'Email Address'
  );
  
  if (!email) {
    Notification.warning('Cancelled', 'Registration cancelled');
    return;
  }
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (response.ok) {
      await Modal.success(
        'Check your email for confirmation',
        'Registration Successful'
      );
    } else {
      await Modal.error(
        'This email is already registered',
        'Registration Failed'
      );
    }
  } catch (error) {
    await Modal.error('An error occurred', 'Error');
  }
}
```

### Multi-Step Process
```javascript
async function startMultiStep() {
  // Step 1: Confirmation
  const confirmed = await Modal.confirm(
    'Start the import process?',
    'Confirm Import'
  );
  if (!confirmed) return;
  
  Notification.info('Importing', 'Please wait...');
  
  // Step 2: Long operation
  try {
    const response = await fetch('/api/import', { method: 'POST' });
    
    if (response.ok) {
      await Modal.success(
        'Import completed successfully',
        'Import Complete'
      );
    }
  } catch (error) {
    await Modal.error('Import failed', 'Error');
  }
}
```

---

## Styling Options

### Button Types
- `'primary'` - Main action button (maroon)
- `'secondary'` - Secondary action button (gray)
- `'danger'` - Destructive action button (red)
- `'success'` - Positive action button (green)

### Modal Types
- `'success'` - Success modal (green icon)
- `'error'` - Error modal (red icon)
- `'warning'` - Warning modal (amber icon)
- `'info'` - Info modal (blue icon)
- `'confirm'` - Confirmation modal (amber icon)

### Notification Types
- `'success'` - Success notification
- `'error'` - Error notification
- `'warning'` - Warning notification
- `'info'` - Info notification

---

## Dark Mode Support

Both modal and notification systems automatically adapt to dark mode using CSS variables from the design system. No additional code needed!

```javascript
// Dark mode is enabled/disabled via:
// - data-color-mode="dark" on body
// - html.dark class on html element
// Both systems automatically respond to this
```

---

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move through buttons
- **Shift+Tab**: Move backwards through buttons
- **Enter**: Activate focused button
- **Escape**: Close modal

### Screen Readers
- All modals have proper semantic structure
- Buttons are properly labeled
- Focus management is automatic
- ARIA attributes are included

### Motion
- Respects `prefers-reduced-motion` preference
- Animations can be disabled in user settings

### Touch Support
- All buttons have 48px minimum touch target
- Works well on tablets and phones
- Proper spacing for finger interaction

---

## Performance Tips

1. **Avoid Nested Modals**: Don't open modals within modals
2. **Use Notifications for Feedback**: Use toasts instead of modals for quick feedback
3. **Async/Await**: Use async/await for cleaner code
4. **Error Handling**: Always wrap in try/catch blocks
5. **Debounce Actions**: Debounce form submissions to prevent double-clicks

---

## Common Issues & Solutions

### Modal not showing
**Problem**: Modal doesn't appear when called
**Solution**: Ensure `modal.js` is loaded before calling Modal methods
```html
<script src="/js/modal.js"></script> <!-- Must be loaded first -->
```

### Multiple modals opening
**Problem**: Multiple modals appear at once
**Solution**: Always await modal completion before opening another
```javascript
// Correct
await Modal.alert('Message 1');
await Modal.alert('Message 2');

// Incorrect - don't do this
Modal.alert('Message 1');
Modal.alert('Message 2'); // Opens immediately
```

### Notifications not dismissing
**Problem**: Notifications stay on screen
**Solution**: Ensure `notification.js` is loaded and duration is set correctly
```javascript
// Check duration is not 0 (0 = no auto-dismiss)
Notification.show('success', 'Title', 'Message', { duration: 4000 });
```

### Styling not applying
**Problem**: Modals look plain without styling
**Solution**: Ensure CSS files are loaded in correct order
```html
<!-- Design system first -->
<link rel="stylesheet" href="/css/projexia-design-system.css" />
<!-- Then modal styles -->
<link rel="stylesheet" href="/css/modal-modern.css" />
```

---

## Best Practices

1. **Use Appropriate Types**: Use the right modal type for the context
   - Success for completed actions
   - Error for failures
   - Warning for risky operations
   - Info for informational messages

2. **Keep Messages Concise**: Users should understand the message quickly
   - Good: "Saved successfully"
   - Bad: "Your changes have been saved to the database and will be reflected in the system"

3. **Use Notifications for Transient Messages**: Reserve modals for important interactions
   - Notifications: "Item added to cart"
   - Modals: "Are you sure you want to delete this?"

4. **Provide Clear Buttons**: Button labels should indicate the action
   - Good: "Delete" instead of "Yes"
   - Good: "Save Changes" instead of "OK"

5. **Handle Errors Gracefully**: Always catch errors and show appropriate messages
   ```javascript
   try {
     // operation
   } catch (error) {
     await Modal.error(error.message || 'An error occurred', 'Error');
   }
   ```

---

## Need Help?

- Check the UI_ENHANCEMENT_SUMMARY.md for complete feature list
- Review examples in this guide
- Check browser console for errors
- Ensure all scripts are loaded in order

