# FireSafe ITM Mobile - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app involves multi-user functionality with company/property management and inspection history sync.

**Implementation:**
- **SSO preferred**: Apple Sign-In (iOS required), Google Sign-In for cross-platform
- Login/signup screens with company affiliation field during onboarding
- Account screen includes:
  - Inspector profile with badge/certification display
  - Company information
  - Log out (with confirmation for unsaved inspections)
  - Delete account (Settings > Account > Delete, double confirmation)
- Privacy policy & terms of service links (placeholder URLs)

### Navigation Structure
**Tab Navigation** (4 tabs + Floating Action Button)

1. **Home Tab** - Dashboard with upcoming inspections and recent activity
2. **Inspections Tab** - List of all inspection records with search/filter
3. **Properties Tab** - Company and property management
4. **Profile Tab** - Inspector settings, certifications, language preferences
5. **FAB (Floating Action Button)** - "New Inspection" (primary action, center-positioned)

### Screen Specifications

#### 1. Home Dashboard
- **Purpose**: Quick overview of inspection schedule and status
- **Layout**:
  - Transparent header with greeting, language toggle (PT-BR/EN flag icon), and notifications bell
  - Scrollable content: Statistics cards (inspections this week/month), upcoming inspections list, quick access to incomplete inspections
  - Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components**: Status cards, list items with property name and inspection type, progress indicators

#### 2. New Inspection Modal (from FAB)
- **Purpose**: Select inspection type and initiate new form
- **Layout**:
  - Full-screen modal with custom header ("Nova Inspeção" / "New Inspection")
  - Header: Close button (left), title (center)
  - Scrollable grid of inspection type cards organized by category:
    - Sprinkler Systems (Wet Pipe, Dry Pipe, Preaction/Deluge, Foam-Water, Water Spray, Water Mist)
    - Fire Pumps (Weekly, Monthly, Annual Test)
    - Hydrants & Piping (Aboveground, Underground, Flow Test)
    - Tanks & Certificates
  - Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl
- **Components**: Large tappable cards with system icon, name, and NFPA reference

#### 3. Inspection Form Screen
- **Purpose**: Complete inspection checklist with real-time validation
- **Layout**:
  - Non-transparent header with back button (left), "Salvar" / "Save" button (right), form title (center)
  - Scrollable form with sections:
    - Property & Inspector Info (auto-filled if available)
    - Inspection Details (date, contract number, frequency)
    - Checklist Items (grouped by inspection frequency: Daily/Weekly/Monthly/Quarterly/Annually)
  - Floating "Submit" button at bottom when form is complete
  - Safe area: top = Spacing.xl (has non-transparent header), bottom = insets.bottom + Spacing.xl + 60 (floating button height)
- **Components**: 
  - Text inputs, date pickers, segmented controls (Yes/No/N/A)
  - Section headers with frequency badges
  - Pressure/temperature numeric inputs with unit labels (psi, °F/°C)
  - Multi-line text areas for observations
  - Auto-save indicator (subtle pulse animation)
  - Signature capture area with canvas

#### 4. Inspections List
- **Purpose**: Browse and search all inspection records
- **Layout**:
  - Transparent header with search bar and filter button (right)
  - Scrollable list of inspection cards sorted by date (newest first)
  - Pull-to-refresh enabled
  - Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components**: Search bar, filter chips (status, type, date range), list cards with property name, inspection type, date, status badge

#### 5. Inspection Detail Screen
- **Purpose**: View completed inspection with PDF export option
- **Layout**:
  - Non-transparent header with back button (left), "Exportar PDF" / "Export PDF" button (right)
  - Scrollable read-only form displaying all captured data
  - Signature display at bottom
  - Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl
- **Components**: Read-only form fields, signature image, export button

#### 6. Properties Management
- **Purpose**: Manage companies and properties for inspections
- **Layout**:
  - Transparent header with search bar and "+" button (right)
  - Segmented control: Companies / Properties
  - Scrollable list with hierarchy (companies > properties)
  - Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components**: Search bar, segmented control, expandable list items, add button

#### 7. Property Form Screen (Modal)
- **Purpose**: Add/edit company or property details
- **Layout**:
  - Custom modal header with "Cancelar" / "Cancel" (left), title, "Salvar" / "Save" (right)
  - Scrollable form with fields: name, address, phone, contact person
  - Submit/cancel buttons in header
  - Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl (keyboard-aware)
- **Components**: Text inputs, phone input with formatting

#### 8. Profile/Settings Screen
- **Purpose**: Inspector profile, app preferences, certifications
- **Layout**:
  - Non-transparent header with "Perfil" / "Profile" title
  - Scrollable sections:
    - Inspector info (avatar, name, certification badges)
    - Language selection (PT-BR/EN)
    - Theme toggle (light/dark)
    - Notifications preferences
    - About & Help
    - Account actions (nested)
  - Safe area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components**: Avatar with edit button, settings list items with disclosure indicators, toggle switches

## Design System

### Color Palette
**Primary**: Safety Orange (#FF6B00) - represents fire safety urgency and professionalism
**Secondary**: Deep Blue (#1A365D) - trust and compliance
**Success**: Forest Green (#22863A) - completed inspections
**Warning**: Amber (#F59E0B) - pending/incomplete
**Error**: Fire Red (#DC2626) - failed items or critical issues
**Neutral Grays**: 
- Background Light: #F7FAFC
- Background Dark: #1A202C
- Text Primary: #2D3748
- Text Secondary: #718096
- Border: #E2E8F0

### Typography
**Primary Font**: SF Pro (iOS) / Roboto (Android)
- **Headings**: 
  - H1: 28pt, Bold (screen titles)
  - H2: 22pt, Semibold (section headers)
  - H3: 18pt, Semibold (checklist categories)
- **Body**: 16pt, Regular (form labels, checklist items)
- **Caption**: 14pt, Regular (helper text, timestamps)
- **Button**: 16pt, Semibold

### Visual Design
- **Icons**: Feather icons from @expo/vector-icons for all UI elements
  - Fire systems: droplet, shield, tool icons
  - Actions: check-circle, x-circle, minus-circle (for Yes/No/N/A)
  - Navigation: standard system icons
- **No emojis** - professional inspection tool
- **Floating Action Button**: 
  - Shadow specifications: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
  - Safety Orange background with white plus icon
  - Size: 56x56pt
- **Cards**: Subtle borders (1pt), minimal shadows, rounded corners (12pt)
- **Form Elements**:
  - All inputs have clear labels above
  - Active state: primary color border
  - Error state: red border with error text below
  - Success state: green checkmark icon (right)
- **Status Badges**: 
  - Pill-shaped (full rounded), uppercase text
  - Complete: green background
  - Pending: amber background
  - Failed: red background
- **Checklist Items**: 
  - Three-button segmented control for Yes/No/N/A
  - Selected state: filled with corresponding color (green/red/gray)
  - Unselected: outline only
- **Signature Capture**: 
  - Canvas with dashed border
  - Clear button in top-right corner of canvas
  - Black stroke on white/transparent background

### Required Assets
1. **Inspection Type Icons** (generate 6 unique icons):
   - Wet Pipe Sprinkler (water droplet with pipes)
   - Dry Pipe Sprinkler (pipes with valve)
   - Fire Pump (pump mechanism)
   - Hydrant System (fire hydrant)
   - Water Tank (storage tank)
   - Certificate/Document (clipboard with checklist)
2. **NFPA Badge**: Official-looking compliance badge for About screen

### Interaction Design
- **Form Auto-save**: Subtle pulse animation on "Auto-saved" indicator (3s display)
- **Checklist Selection**: Haptic feedback on Yes/No/N/A button press
- **Card Press**: Scale down to 0.98 with subtle shadow increase
- **Pull-to-refresh**: Standard platform spinner
- **Validation**: Real-time border color change (red for errors, green for valid)
- **FAB**: Rotate icon 45° on press, scale up to 1.1
- **Modal Presentation**: Slide up from bottom with backdrop dim

### Accessibility
- Minimum touch target: 44x44pt
- Color contrast ratio: 4.5:1 for text, 3:1 for UI components
- Form labels always visible (no placeholder-only inputs)
- Error messages announced via screen reader
- All interactive elements have accessible labels
- Support for Dynamic Type (text scaling)
- VoiceOver/TalkBack optimization for checklist navigation
- Signature canvas has alternative text input option for accessibility