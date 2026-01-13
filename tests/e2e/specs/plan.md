# Test Plan: Meetup Info Block

**Block Name:** `meetup/info`
**Block Type:** WordPress Gutenberg Block (Dynamic Block)
**Test Environment:** WordPress Block Editor (Gutenberg)
**Base URL:** http://localhost:8889

## Overview

This test plan covers comprehensive testing of the Meetup Info block, which displays meetup information (title, date, location) in the WordPress block editor and on the frontend. The block uses InspectorControls for attribute editing and renders dynamically via PHP.

## Block Attributes

- **title** (string, default: "Playwright + AI")
- **date** (string, default: "Janeiro 2026")
- **location** (string, default: "Lisboa, Portugal")

## Test Data Attributes

The block uses the following `data-testid` attributes for reliable testing:
- `data-testid="meetup-info"` - Main block container
- `data-testid="meetup-title"` - Title element
- `data-testid="meetup-date"` - Date element
- `data-testid="meetup-location"` - Location element
- `data-testid="meetup-details"` - Details container

## Test Suite: Meetup Info Block

### 1. Block Insertion and Default UI Verification

**Seed:** `tests/e2e/seed.spec.ts` (if applicable, otherwise assume fresh editor state)

#### 1.1 Insert Block and Verify Default Attributes

**Steps:**
1. Navigate to WordPress admin and create a new post
2. Click the block inserter (+ button)
3. Search for "Meetup Info" or navigate to Widgets category
4. Click to insert the `meetup/info` block
5. Verify the block is inserted and visible in the editor canvas

**Expected Outcomes:**
- Block is successfully inserted into the editor
- Block container with `data-testid="meetup-info"` is visible
- Title displays default value "Playwright + AI" in element with class `meetup-info__title`
- Date displays default value "Janeiro 2026" in element with `data-testid="meetup-date"`
- Location displays default value "Lisboa, Portugal" in element with `data-testid="meetup-location"`
- Date and location are formatted with emoji prefixes (📅 and 📍)
- Details are separated by " | " separator

**Success Criteria:**
- All default attribute values are correctly displayed
- Block structure matches expected HTML structure
- No console errors during block insertion

**Failure Conditions:**
- Block fails to insert
- Default values are not displayed
- Block structure is malformed

---

#### 1.2 Verify Block Selection and Focus States

**Steps:**
1. Insert the `meetup/info` block (from scenario 1.1)
2. Click on the block in the editor canvas
3. Verify block selection indicators are visible
4. Verify block toolbar appears (if applicable)

**Expected Outcomes:**
- Block becomes selected when clicked
- Visual selection indicators (outline, highlight) are visible
- Block toolbar or controls are accessible
- InspectorControls panel can be opened

**Success Criteria:**
- Block selection state is clearly indicated
- User can interact with block controls

---

### 2. InspectorControls Editing Scenarios

**Seed:** `tests/e2e/seed.spec.ts` (if applicable)

#### 2.1 Edit Title via InspectorControls

**Steps:**
1. Insert the `meetup/info` block with default attributes
2. Click on the block to select it
3. Open the Settings sidebar (click Settings button if not already open)
4. Navigate to Block tab in the settings panel
5. Locate the "Title" TextControl in the "Meetup Settings" panel
6. Clear the existing title value
7. Type a new title: "Custom Meetup Title"
8. Click outside the input field or press Tab to blur the field
9. Observe the editor canvas preview

**Expected Outcomes:**
- Settings sidebar opens successfully
- "Meetup Settings" panel is visible and expanded
- Title TextControl is visible and editable
- New title value "Custom Meetup Title" appears in the editor canvas preview
- Title element (`.meetup-info__title`) updates immediately after blur
- No page reload is required for preview update

**Success Criteria:**
- Title attribute is updated in real-time
- Preview reflects changes immediately
- Attribute persists when block loses focus

**Failure Conditions:**
- InspectorControls panel does not open
- Title field is not editable
- Preview does not update after editing
- Changes are lost when block is deselected

---

#### 2.2 Edit Date via InspectorControls

**Steps:**
1. Insert the `meetup/info` block with default attributes
2. Select the block
3. Open Settings sidebar and navigate to Block tab
4. Locate the "Date" TextControl in "Meetup Settings" panel
5. Clear the existing date value
6. Type a new date: "December 2026"
7. Blur the date field (click outside or press Tab)
8. Observe the editor canvas preview

**Expected Outcomes:**
- Date TextControl is visible and editable
- New date value "December 2026" appears in the editor canvas
- Date element (`[data-testid="meetup-date"]`) updates to show "📅 December 2026"
- Preview updates immediately without page reload

**Success Criteria:**
- Date attribute updates in real-time
- Emoji prefix (📅) is preserved in display
- Changes persist when block loses focus

**Failure Conditions:**
- Date field is not editable
- Preview does not update
- Emoji prefix is missing or incorrect

---

#### 2.3 Edit Location via InspectorControls

**Steps:**
1. Insert the `meetup/info` block with default attributes
2. Select the block
3. Open Settings sidebar and navigate to Block tab
4. Locate the "Location" TextControl in "Meetup Settings" panel
5. Clear the existing location value
6. Type a new location: "Remote"
7. Blur the location field
8. Observe the editor canvas preview

**Expected Outcomes:**
- Location TextControl is visible and editable
- New location value "Remote" appears in the editor canvas
- Location element (`[data-testid="meetup-location"]`) updates to show "📍 Remote"
- Preview updates immediately

**Success Criteria:**
- Location attribute updates in real-time
- Emoji prefix (📍) is preserved in display
- Changes persist when block loses focus

**Failure Conditions:**
- Location field is not editable
- Preview does not update
- Emoji prefix is missing or incorrect

---

#### 2.4 Edit All Attributes Sequentially

**Steps:**
1. Insert the `meetup/info` block with default attributes
2. Select the block and open Settings sidebar
3. Edit title to "Updated Title"
4. Edit date to "Updated Date"
5. Edit location to "Updated Location"
6. Verify all three attributes are updated in the preview
7. Deselect and reselect the block
8. Verify all attributes persist

**Expected Outcomes:**
- All three TextControls can be edited in sequence
- Each edit updates the preview immediately
- All three attributes display correctly in the preview
- Attributes persist after block deselection and reselection
- InspectorControls show the updated values when block is reselected

**Success Criteria:**
- Multiple attribute edits work correctly
- No conflicts between simultaneous edits
- All changes persist correctly

**Failure Conditions:**
- One or more attributes fail to update
- Changes are lost when block is deselected
- Preview shows incorrect values

---

### 3. Save, Publish, and Frontend Rendering

**Seed:** `tests/e2e/seed.spec.ts` (if applicable)

#### 3.1 Save Draft and Verify Persistence

**Steps:**
1. Create a new post
2. Insert the `meetup/info` block
3. Edit title to "Draft Test Title"
4. Edit date to "Draft Test Date"
5. Edit location to "Draft Test Location"
6. Click "Save draft" button
7. Wait for save confirmation
8. Reload the page
9. Verify block attributes are preserved in the editor

**Expected Outcomes:**
- Draft saves successfully
- Save confirmation appears
- After page reload, block is still present
- All edited attributes (title, date, location) are preserved
- Editor canvas shows the saved values

**Success Criteria:**
- Attributes persist after save and reload
- No data loss during save operation
- Block state is correctly restored

**Failure Conditions:**
- Save operation fails
- Attributes are lost after reload
- Block disappears after reload

---

#### 3.2 Publish Post and Verify Frontend Rendering

**Steps:**
1. Create a new post
2. Insert the `meetup/info` block
3. Edit title to "Published Test Title"
4. Edit date to "Published Test Date"
5. Edit location to "Published Test Location"
6. Click "Publish" button
7. Confirm publication
8. Click "View Post" link or navigate to the post URL
9. Verify block rendering on the frontend

**Expected Outcomes:**
- Post publishes successfully
- Frontend page loads correctly
- Block container with `data-testid="meetup-info"` is visible on frontend
- Title "Published Test Title" is displayed in `h3.meetup-info__title` element
- Date "Published Test Date" is displayed with emoji prefix (📅) in `[data-testid="meetup-date"]`
- Location "Published Test Location" is displayed with emoji prefix (📍) in `[data-testid="meetup-location"]`
- Date and location are separated by " | "
- HTML structure matches expected output from `render.php`

**Success Criteria:**
- All attributes render correctly on frontend
- Emoji prefixes are present
- HTML structure is correct
- No PHP errors or warnings

**Failure Conditions:**
- Block does not render on frontend
- Attributes are missing or incorrect
- HTML structure is malformed
- PHP errors appear

---

#### 3.3 Verify Frontend Rendering with Default Attributes

**Steps:**
1. Create a new post
2. Insert the `meetup/info` block without editing attributes
3. Publish the post
4. Navigate to the frontend post URL
5. Verify default values are rendered

**Expected Outcomes:**
- Post publishes successfully
- Frontend displays default title "Playwright + AI"
- Frontend displays default date "Janeiro 2026" with emoji
- Frontend displays default location "Lisboa, Portugal" with emoji
- All default values match block.json defaults

**Success Criteria:**
- Default attributes render correctly
- No empty or missing values
- Fallback values work as expected

**Failure Conditions:**
- Default values are not displayed
- Empty values appear
- PHP fallback values are incorrect

---

### 4. Negative Test Cases and Edge Cases

**Seed:** `tests/e2e/seed.spec.ts` (if applicable)

#### 4.1 Empty Title Field

**Steps:**
1. Insert the `meetup/info` block
2. Select the block and open Settings sidebar
3. Clear the title field completely (empty string)
4. Blur the field
5. Observe editor canvas preview
6. Save draft and verify persistence
7. Publish and verify frontend rendering

**Expected Outcomes:**
- Title field can be cleared (no validation prevents empty value)
- Editor canvas shows empty title or default fallback
- Empty title persists after save
- Frontend renders empty title or uses PHP fallback value from `render.php` (default: "Playwright + AI")

**Success Criteria:**
- Empty values are handled gracefully
- PHP fallback values work correctly
- No JavaScript errors occur

**Failure Conditions:**
- Empty values cause errors
- Fallback values do not work
- Block breaks with empty attributes

---

#### 4.2 Empty Date Field

**Steps:**
1. Insert the `meetup/info` block
2. Select the block and open Settings sidebar
3. Clear the date field completely
4. Blur the field
5. Observe editor canvas preview
6. Save and verify persistence
7. Publish and verify frontend rendering

**Expected Outcomes:**
- Date field can be cleared
- Editor canvas shows empty date or emoji with no text
- Empty date persists after save
- Frontend renders empty date or uses PHP fallback (default: "Janeiro 2026")

**Success Criteria:**
- Empty date is handled correctly
- Emoji prefix still appears even with empty value
- PHP fallback works on frontend

**Failure Conditions:**
- Empty date causes rendering issues
- Emoji appears without text incorrectly
- Fallback does not work

---

#### 4.3 Empty Location Field

**Steps:**
1. Insert the `meetup/info` block
2. Select the block and open Settings sidebar
3. Clear the location field completely
4. Blur the field
5. Observe editor canvas preview
6. Save and verify persistence
7. Publish and verify frontend rendering

**Expected Outcomes:**
- Location field can be cleared
- Editor canvas shows empty location or emoji with no text
- Empty location persists after save
- Frontend renders empty location or uses PHP fallback (default: "Lisboa, Portugal")

**Success Criteria:**
- Empty location is handled correctly
- Emoji prefix still appears
- PHP fallback works on frontend

**Failure Conditions:**
- Empty location causes rendering issues
- Fallback does not work

---

#### 4.4 Very Long Text Values

**Steps:**
1. Insert the `meetup/info` block
2. Select the block and open Settings sidebar
3. Enter a very long title (500+ characters)
4. Enter a very long date (200+ characters)
5. Enter a very long location (200+ characters)
6. Verify editor canvas preview handles long text
7. Save and publish
8. Verify frontend rendering handles long text

**Expected Outcomes:**
- All fields accept very long text values
- Editor canvas displays long text (may wrap or truncate)
- Long text persists after save
- Frontend renders long text correctly
- No layout breaking or overflow issues

**Success Criteria:**
- Long text is handled gracefully
- Layout remains intact
- Text is not truncated unexpectedly

**Failure Conditions:**
- Long text causes layout breaking
- Text is truncated incorrectly
- Performance issues with long text

---

#### 4.5 Special Characters and HTML

**Steps:**
1. Insert the `meetup/info` block
2. Select the block and open Settings sidebar
3. Enter title with special characters: "Test's Title with \"quotes\" & <tags>"
4. Enter date with special characters: "Date with émojis 🎉"
5. Enter location with unicode: "Location with unicode: 中文"
6. Verify editor canvas preview
7. Save and publish
8. Verify frontend rendering escapes HTML correctly

**Expected Outcomes:**
- Special characters are accepted in all fields
- HTML tags are displayed as text (not rendered) in editor
- Special characters persist after save
- Frontend properly escapes HTML (using `esc_html()` in PHP)
- XSS attempts are prevented (e.g., `<script>` tags are escaped)

**Success Criteria:**
- Special characters work correctly
- HTML is properly escaped on frontend
- No XSS vulnerabilities
- Unicode characters display correctly

**Failure Conditions:**
- HTML is rendered instead of escaped
- XSS vulnerabilities exist
- Unicode characters break rendering

---

#### 4.6 Multiple Blocks on Same Page

**Steps:**
1. Create a new post
2. Insert first `meetup/info` block with custom attributes
3. Insert second `meetup/info` block with different attributes
4. Insert third `meetup/info` block with default attributes
5. Verify all blocks display correctly in editor
6. Save and publish
7. Verify all blocks render correctly on frontend

**Expected Outcomes:**
- All three blocks are inserted successfully
- Each block displays its own attribute values independently
- Blocks do not interfere with each other
- All blocks render correctly on frontend
- Each block has its own `data-testid="meetup-info"` container

**Success Criteria:**
- Multiple instances work independently
- No attribute mixing between blocks
- Frontend renders all blocks correctly

**Failure Conditions:**
- Blocks interfere with each other
- Attributes are shared incorrectly
- Frontend rendering fails for multiple blocks

---

## Locator Strategy

Based on code analysis, use the following stable locators:

### Editor Canvas
- Block container: `editor.canvas.locator('[data-testid="meetup-info"]')` or `.meetup-info`
- Title: `editor.canvas.locator('.meetup-info__title')` or `[data-testid="meetup-title"]`
- Date: `editor.canvas.locator('[data-testid="meetup-date"]')`
- Location: `editor.canvas.locator('[data-testid="meetup-location"]')`

### InspectorControls
- Settings button: `page.getByRole('button', { name: 'Settings' })`
- Block settings panel: `page.getByRole('region', { name: 'Editor settings' }).getByRole('tabpanel', { name: 'Block' })`
- Title field: `blockSettingsPanel.getByRole('textbox', { name: 'Title' })`
- Date field: `blockSettingsPanel.getByRole('textbox', { name: 'Date' })`
- Location field: `blockSettingsPanel.getByRole('textbox', { name: 'Location' })`

### Frontend
- Block container: `page.locator('[data-testid="meetup-info"]')`
- Title: `page.locator('.meetup-info__title')` or `[data-testid="meetup-title"]`
- Date: `page.locator('[data-testid="meetup-date"]')`
- Location: `page.locator('[data-testid="meetup-location"]')`

## Test Environment Assumptions

- Fresh editor state for each test (unless seed file is specified)
- WordPress admin access is available
- Block plugin is activated
- No existing posts/pages interfere with tests
- Base URL: http://localhost:8889
- WordPress e2e-test-utils-playwright package is available

## Notes

- The block uses `save: () => null`, indicating it's a dynamic block rendered server-side
- Frontend rendering uses `render.php` with PHP fallback values
- All attributes are optional strings with defaults defined in `block.json`
- The block does not appear to have client-side validation for empty fields
- HTML escaping is handled by PHP `esc_html()` function in `render.php`
