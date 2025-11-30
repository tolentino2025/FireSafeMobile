# FireSafe ITM - Mobile App

## Overview
FireSafe ITM is a mobile application for fire protection systems Inspection, Testing, and Maintenance (ITM) in compliance with NFPA 25 standards. Built with React Native and Expo.

## Current State
- **Version**: 1.0.0
- **Platform**: iOS, Android, Web (Expo)
- **Language Support**: Portuguese (BR) and English
- **Theme Support**: Light, Dark, and System automatic modes
- **Architecture**: Offline-first with AsyncStorage - all data saved locally on device

## Key Features
1. **Inspection Management**: Create, view, edit, and delete fire safety inspections
2. **Multiple Inspection Types**:
   - Sprinkler Systems (Wet Pipe, Dry Pipe, Preaction/Deluge, Foam-Water, Water Spray, Water Mist)
   - Fire Pumps (Weekly, Monthly, Annual)
   - Hydrants & Piping (Aboveground, Underground, Flow Test, Standpipe)
   - Tanks & Certificates (Water Tank, Hazard Evaluation)
3. **Company Management**: Register and manage companies with full contact information (CNPJ, address, phone, email)
4. **Inspector Management**: Register inspectors with role and contact details
5. **Property Management**: Track properties linked to companies
6. **Dropdown Selection**: Select companies and inspectors via dropdowns during inspection creation with auto-fill
7. **Digital Signatures**: Capture signatures on inspection forms
8. **Checklist System**: Yes/No/N/A responses with PSI value inputs, frequency-based filtering (NFPA 25 compliant)
9. **Auto-save**: Forms automatically save progress
10. **Bilingual UI**: Portuguese and English language support
11. **Photo Capture**: Attach photos to inspections using camera or gallery
12. **PDF Reports**: Generate professional NFPA 25 compliant PDF reports with full company and inspector details
13. **Share & Export**: Share reports via email, WhatsApp, and other apps
14. **Notifications**: Schedule reminders for upcoming inspections

## Project Architecture

### Directory Structure
```
/
├── App.tsx                 # Main app entry point
├── app.json                # Expo configuration
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ChecklistItemRow.tsx
│   ├── CompanyCard.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── HeaderTitle.tsx
│   ├── InspectionCard.tsx
│   ├── PropertyCard.tsx
│   ├── ScreenFlatList.tsx
│   ├── ScreenKeyboardAwareScrollView.tsx
│   ├── ScreenScrollView.tsx
│   ├── SelectPicker.tsx    # Reusable dropdown component
│   ├── SignatureCapture.tsx
│   ├── Spacer.tsx
│   ├── StatCard.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   ├── i18n.ts             # Translations (PT-BR/EN)
│   └── theme.ts            # Colors, spacing, typography, gradients
├── contexts/
│   ├── InspectionContext.tsx  # Inspection, Company, AppUser data state
│   ├── LanguageContext.tsx    # Language preferences
│   └── ThemeContext.tsx       # Theme mode and fullTheme provider
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenInsets.ts
│   └── useTheme.ts            # Returns fullTheme object with complete theme data
├── navigation/
│   ├── HomeStackNavigator.tsx
│   ├── InspectionsStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   ├── PropertiesStackNavigator.tsx
│   └── screenOptions.ts
├── screens/
│   ├── CompanyFormScreen.tsx    # Create/edit companies
│   ├── HomeScreen.tsx
│   ├── InspectionDetailScreen.tsx
│   ├── InspectionFormScreen.tsx
│   ├── InspectionsListScreen.tsx
│   ├── NewInspectionScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── PropertiesScreen.tsx     # 3-tab view: Companies, Inspectors, Properties
│   ├── PropertyFormScreen.tsx
│   └── UserFormScreen.tsx       # Create/edit inspectors
└── utils/
    ├── checklistTemplates.ts    # NFPA 25 checklist templates
    ├── notifications.ts         # Push notification scheduling
    ├── pdfGenerator.ts          # PDF report generation with company/inspector data
    └── photoUtils.ts            # Photo handling utilities
```

### Data Persistence
- Uses AsyncStorage for local data persistence
- Stores: inspections, properties, companies, appUsers, schedules, language preference, theme mode
- Auto-save functionality for inspection forms
- Company and inspector data embedded in inspections for PDF generation
- Inspection schedules stored for NFPA 25 compliant recurring reminders

### Data Types (types/inspection.ts)
- **Company**: id, name, cnpj, address, city, state, zipCode, contactName, contactPhone, contactEmail
- **AppUser**: id, name, email, phone, role
- **Property**: id, name, address, phone, contact, companyId
- **Inspection**: includes companyId, companyData, inspectorId, inspectorData for full data embedding
- **ChecklistItem**: id, labelKey, label, value (yes/no/na/null), psiValue, numericFields[], textFields[], notes
- **NumericField**: id, labelKey, type (NumericFieldType), value, unit
- **NumericFieldType**: static_psi, residual_psi, psi, seconds, minutes, gpm, rpm, voltage, amperage, percent, temperature, gallons
- **InspectionSchedule**: id, companyId, propertyId, firePumpId, inspectionType, frequency, startDate, lastInspectionDate, nextDueDate, notificationId, isActive, createdAt, updatedAt

### Design System - Red/Black Professional Theme
- **Primary Color**: Fire Red (#DC2626)
- **Primary Dark**: Dark Red (#991B1B) 
- **Primary Light**: Light Red (#FCA5A5)
- **Success**: Emerald Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Rose Red (#EF4444)

#### Light Theme
- Background: White (#FFFFFF)
- Card Background: Gray 50 (#F9FAFB)
- Text Primary: Gray 900 (#111827)
- Text Secondary: Gray 500 (#6B7280)
- Border: Gray 200 (#E5E7EB)

#### Dark Theme  
- Background: Gray 950 (#030712)
- Card Background: Gray 900 (#111827)
- Text Primary: White (#FFFFFF)
- Text Secondary: Gray 400 (#9CA3AF)
- Border: Gray 700 (#374151)

### Theme Usage Pattern
Components should use `fullTheme` from `useTheme()` hook:
```tsx
const { fullTheme } = useTheme();

// Access colors
fullTheme.colors.primary
fullTheme.colors.cardBackground
fullTheme.colors.textPrimary
fullTheme.colors.textSecondary
fullTheme.colors.border

// Access shadows
fullTheme.shadows.small
fullTheme.shadows.medium
fullTheme.shadows.large

// Access gradients
fullTheme.gradients.primary
fullTheme.gradients.dark
```

## Navigation Structure
- **Bottom Tab Navigator** with 4 tabs:
  1. Home - Dashboard with stats and recent activity
  2. Inspections - List of all inspections
  3. Properties - 3-tab layout (Companies, Inspectors, Properties)
  4. Profile - Settings and preferences (including theme selection)
- **Floating Action Button** for creating new inspections

## Running the App
```bash
npm run dev
```
Scan the QR code with Expo Go (iOS/Android) or open web version at localhost:8081

## Recent Changes (November 2025)
- **NFPA 25 Automated Scheduling System**:
  - Added InspectionSchedule interface for tracking recurring inspection schedules
  - Created utils/scheduleUtils.ts with date calculation functions (addInterval, generateScheduleId)
  - Extended utils/notifications.ts with scheduleNotificationForSchedule function
  - Updated InspectionContext to manage schedules state with AsyncStorage persistence
  - Implemented createOrUpdateScheduleForInspection for automatic schedule creation after inspection completion
  - Supports all NFPA 25 frequencies: daily, weekly, monthly, quarterly, annually, five_years
  - Push notifications scheduled for reminder based on next due date
- **NFPA 25 Enhanced Compliance System**:
  - Created comprehensive type system (types/inspection.ts) with ChecklistItem, NumericField, TestSection
  - Enhanced ChecklistItem to support multiple numeric fields per item (static/residual pressure, flow rate, trip time, etc.)
  - Added 23 NumericFieldType values: static_psi, residual_psi, psi, seconds, minutes, gpm, rpm, voltage, amperage, percent, temperature, gallons
  - Updated checklistTemplates.ts with test-specific sections (dryPipeTripTest, mainDrainTest, hydrantFlowTest, foamDischargeTest)
  - ChecklistItemRow now supports multiple numeric inputs and optional notes per item
  - InspectionDetailScreen displays all numeric fields and notes with proper translations
  - PDF reports include all numeric measurements with bilingual labels
  - Automatic data migration from legacy psiValue structure to new numericFields model
- **Red/Black Professional Design System**:
  - Updated theme.ts with new color palette (Fire Red primary, dark backgrounds)
  - Enhanced ThemeContext with fullTheme object containing complete theme data
  - Updated all components to use fullTheme.colors.* pattern
  - Added gradient support for buttons and cards
  - Improved card styling with subtle borders
- **Company & Inspector Management System**:
  - Created CompanyFormScreen for registering companies with CNPJ, address, and contact info
  - Created UserFormScreen for registering inspectors with role and contact details
  - Updated PropertiesScreen with 3-tab navigation (Companies, Inspectors, Properties)
- **Dropdown Selection in Inspection Form**:
  - Created SelectPicker component for reusable dropdown functionality
  - InspectionFormScreen now has company and inspector dropdowns
  - Auto-fill: selecting a company populates property name, address, and phone
  - Auto-fill: selecting an inspector populates inspector name
- **Enhanced PDF Reports**:
  - PDF now includes full company section (name, CNPJ, address, contact)
  - PDF now includes inspector section (name, role, phone, email)
  - Company and inspector data embedded in inspection for offline PDF generation
  - Numeric fields display with translated labels in reports
- **Previous Updates**:
  - Implemented frequency-based checklist filtering per NFPA 25 standards
  - Added 100+ translation keys for comprehensive checklist coverage

## Future Enhancements
- Cloud sync and backup with external API
- Multi-inspector team collaboration
- Barcode/QR code scanning for equipment identification
