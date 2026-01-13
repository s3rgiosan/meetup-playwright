# Test Plan: Meetup Info Block

## Test Suite: Meetup Info Block

### Prerequisites
- WordPress block editor (Gutenberg) accessible at `http://localhost:8889/wp-admin`
- User logged in as admin (credentials: admin/password)
- Fresh editor state (new post/page)
- Block `meetup/info` is registered and available

### Locator Strategy
The block uses stable `data-testid` attributes:
- Block container: `[data-testid="meetup-info"]`
- Title: `[data-testid="meetup-title"]`
- Date: `[data-testid="meetup-date"]`
- Location: `[data-testid="meetup-location"]`
- Details container: `[data-testid="meetup-details"]`

Editor settings panel:
- Title field: `textbox[name="Title"]` (in Block settings panel)
- Date field: `textbox[name="Date"]` (in Block settings panel)
- Location field: `textbox[name="Location"]` (in Block settings panel)

Block inserter:
- Search for "Meetup Info" or use option with text "Meetup Info"

---

## Scenario 1: Insert Block and Verify Default UI

### Objective
Verify that the block can be inserted and displays default values correctly in the editor.

### Steps
1. Navigate to `http://localhost:8889/wp-admin/post-new.php`
2. Wait for the editor to load completely
3. Click the "Add block" button (or press `/` to open block inserter)
4. Search for "Meetup Info" in the block inserter
5. Click on the "Meetup Info" option to insert the block
6. Verify the block is inserted in the editor canvas
7. Open the Block settings panel (if not already open)
8. Verify the Title field displays default value: "Playwright + AI"
9. Verify the Date field displays default value: "Janeiro 2026"
10. Verify the Location field displays default value: "Lisboa, Portugal"
11. Verify the block preview in the editor canvas shows:
    - Heading (h3) with text "Playwright + AI"
    - Paragraph containing: "📅 Janeiro 2026 | 📍 Lisboa, Portugal"

### Expected Outcomes
- Block is successfully inserted
- All three fields (Title, Date, Location) show default values in settings panel
- Block preview in editor matches default values
- Block is visible and properly formatted in the editor canvas

### Success Criteria
- Block appears in editor without errors
- Default values are correctly displayed in both settings panel and preview
- No console errors related to block rendering

---

## Scenario 2: Edit Title/Date/Location and Verify Preview Updates

### Objective
Verify that editing block attributes updates the preview in real-time.

### Steps
1. Start with Scenario 1 completed (block inserted with default values)
2. In the Block settings panel, locate the Title textbox
3. Clear the Title field and type: "Lisbon WordPress Meetup"
4. Verify the preview heading updates immediately to show "Lisbon WordPress Meetup"
5. Locate the Date textbox in the settings panel
6. Clear the Date field and type: "15 de Fevereiro de 2026"
7. Verify the preview updates to show: "📅 15 de Fevereiro de 2026"
8. Locate the Location textbox in the settings panel
9. Clear the Location field and type: "Porto, Portugal"
10. Verify the preview updates to show: "📍 Porto, Portugal"
11. Verify the complete preview shows:
    - Heading: "Lisbon WordPress Meetup"
    - Details paragraph: "📅 15 de Fevereiro de 2026 | 📍 Porto, Portugal"
12. Edit Title again to: "Porto Tech Meetup"
13. Verify preview updates immediately
14. Edit Date to: "20 de Março de 2026"
15. Verify preview updates immediately
16. Edit Location to: "Braga, Portugal"
17. Verify preview updates immediately

### Expected Outcomes
- Each field edit updates the preview in real-time
- No delay between typing and preview update
- Preview accurately reflects all three fields
- Settings panel values match preview values

### Success Criteria
- Preview updates synchronously with field edits
- All three fields (Title, Date, Location) update independently
- No data loss or incorrect rendering during edits

---

## Scenario 3: Save/Publish and Verify Frontend Rendering

### Objective
Verify that the block saves correctly and renders properly on the frontend.

### Steps
1. Start with Scenario 2 completed (block edited with custom values)
2. Add a post title: "Test Post with Meetup Block"
3. Click the "Publish" button in the editor toolbar
4. Click "Publish" in the publish panel to confirm
5. Wait for the "Post published" notification
6. Click the "View Post" link (or navigate to the post URL)
7. Verify the frontend page loads correctly
8. Locate the meetup block on the frontend using `[data-testid="meetup-info"]`
9. Verify the block title (h3) displays: "Lisbon WordPress Meetup" (or current value)
10. Verify the block details paragraph contains:
    - Date span with `[data-testid="meetup-date"]` showing: "📅 15 de Fevereiro de 2026"
    - Separator: " | "
    - Location span with `[data-testid="meetup-location"]` showing: "📍 Porto, Portugal"
11. Verify the complete block structure:
    - Container has class `meetup-info`
    - Title is an h3 element with class `meetup-info__title`
    - Details paragraph has class `meetup-info__details`
    - Date span has class `meetup-info__date`
    - Location span has class `meetup-info__location`
12. Verify the block is properly styled and visible on the frontend

### Expected Outcomes
- Post publishes successfully
- Block renders correctly on frontend
- All attributes (title, date, location) display as saved
- Block structure matches expected HTML output
- No console errors on frontend

### Success Criteria
- Frontend rendering matches editor preview
- All data-testid attributes are present
- Block is visible and properly formatted
- No missing or incorrect data

---

## Scenario 4: Negative Testing - Empty Required Fields

### Objective
Verify block behavior when fields are left empty (if applicable) or with edge case values.

### Steps
1. Start with a fresh editor state (new post)
2. Insert the Meetup Info block (as in Scenario 1)
3. Clear the Title field completely (leave empty)
4. Verify the preview updates to show an empty heading (h3 with no text)
5. Clear the Date field completely
6. Verify the preview shows: "📅 " (date emoji with empty value)
7. Clear the Location field completely
8. Verify the preview shows: "📅  | 📍 " (both emojis with empty values)
9. Attempt to publish the post with all empty fields
10. Verify if WordPress allows publishing (block may not have validation)
11. If published, verify frontend rendering with empty values
12. Test with very long text:
    - Enter a title with 200+ characters
    - Enter a date with 100+ characters
    - Enter a location with 100+ characters
13. Verify preview handles long text appropriately
14. Publish and verify frontend rendering with long text

### Expected Outcomes
- Block accepts empty values without validation errors
- Preview reflects empty state correctly
- Long text is handled gracefully (may wrap or truncate)
- Frontend renders empty values if published
- No JavaScript errors with edge cases

### Success Criteria
- Block does not crash with empty values
- Preview accurately reflects empty state
- Long text is displayed (or handled) appropriately
- No validation errors (as block has no validation implemented)

### Notes
Based on code analysis, the block does not implement validation. Empty values are accepted and rendered as-is. This is expected behavior for this block implementation.

---

## Scenario 5: Negative Testing - Invalid Date Format (if applicable)

### Objective
Verify block behavior with various date formats and invalid inputs.

### Steps
1. Start with a fresh editor state
2. Insert the Meetup Info block
3. Test various date formats in the Date field:
   - "32 de Janeiro de 2026" (invalid day)
   - "30 de Fevereiro de 2026" (invalid month)
   - "abc123" (non-date text)
   - "2026-13-45" (invalid date format)
   - "Yesterday" (relative date)
4. Verify the preview displays the entered text as-is (no validation)
5. Verify no error messages appear
6. Publish the post with invalid date formats
7. Verify frontend renders the invalid date text as entered
8. Test with special characters in date: "15/02/2026 @ 18:00"
9. Verify preview and frontend handle special characters

### Expected Outcomes
- Block accepts any text in the Date field (no validation)
- Preview displays entered text exactly as typed
- No error messages or warnings
- Frontend renders invalid dates as plain text

### Success Criteria
- Block handles invalid date formats without errors
- User-entered text is preserved exactly
- No validation errors (expected, as block has no date validation)

### Notes
The block uses a simple TextControl for the date field with no validation. Any text input is accepted and rendered as-is. This is the current implementation behavior.

---

## Test Data

### Default Values
- Title: "Playwright + AI"
- Date: "Janeiro 2026"
- Location: "Lisboa, Portugal"

### Test Values Used
- Title: "Lisbon WordPress Meetup", "Porto Tech Meetup"
- Date: "15 de Fevereiro de 2026", "20 de Março de 2026"
- Location: "Porto, Portugal", "Braga, Portugal"

### Edge Case Values
- Empty strings for all fields
- Long text (200+ characters)
- Special characters: "/", "@", "|"
- Invalid date formats

---

## Locator Reference

### Editor (Gutenberg)
- Block inserter button: `button[aria-label*="Add block"]` or `button:has-text("Add block")`
- Block search: `searchbox[name="Search"]` in block inserter
- Meetup Info option: `option:has-text("Meetup Info")` or `[role="option"]:has-text("Meetup Info")`
- Title field: `textbox[name="Title"]` (in Block settings panel)
- Date field: `textbox[name="Date"]` (in Block settings panel)
- Location field: `textbox[name="Location"]` (in Block settings panel)
- Editor canvas iframe: `iframe[name="editor-canvas"]`
- Block preview in editor: `iframe[name="editor-canvas"] >> [data-testid="meetup-info"]`

### Frontend
- Block container: `[data-testid="meetup-info"]`
- Title: `[data-testid="meetup-title"]`
- Date: `[data-testid="meetup-date"]`
- Location: `[data-testid="meetup-location"]`
- Details: `[data-testid="meetup-details"]`

---

## Assumptions
- Fresh editor state for each scenario (unless explicitly stated otherwise)
- User is logged in as admin
- Block plugin is active and registered
- No other blocks or content interfere with testing
- Browser supports modern JavaScript (required for Gutenberg)

---

## Notes
- The block uses `save: () => null`, meaning it's a dynamic block rendered server-side via PHP
- No client-side validation is implemented
- All fields are optional (no required validation)
- Block preview updates in real-time as attributes change
- Frontend rendering uses PHP template (`render.php`)
