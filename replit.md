# FireSafe ITM - Mobile App

## Overview
FireSafe ITM is a mobile application for fire protection systems Inspection, Testing, and Maintenance (ITM) in compliance with NFPA 25 standards. Built with React Native and Expo.

## Current State
- **Version**: 1.0.0
- **Platform**: iOS, Android, Web (Expo)
- **Language Support**: Portuguese (BR) and English

## Key Features
1. **Inspection Management**: Create, view, edit, and delete fire safety inspections
2. **Multiple Inspection Types**:
   - Sprinkler Systems (Wet Pipe, Dry Pipe, Preaction/Deluge, Foam-Water, Water Spray, Water Mist)
   - Fire Pumps (Weekly, Monthly, Annual)
   - Hydrants & Piping (Aboveground, Underground, Flow Test, Standpipe)
   - Tanks & Certificates (Water Tank, Hazard Evaluation)
3. **Property & Company Management**: Track properties and companies for inspections
4. **Digital Signatures**: Capture signatures on inspection forms
5. **Checklist System**: Yes/No/N/A responses with PSI value inputs, frequency-based filtering (NFPA 25 compliant)
6. **Auto-save**: Forms automatically save progress
7. **Bilingual UI**: Portuguese and English language support
8. **Photo Capture**: Attach photos to inspections using camera or gallery
9. **PDF Reports**: Generate professional NFPA 25 compliant PDF reports
10. **Share & Export**: Share reports via email, WhatsApp, and other apps
11. **Notifications**: Schedule reminders for upcoming inspections

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
│   ├── SignatureCapture.tsx
│   ├── Spacer.tsx
│   ├── StatCard.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   ├── i18n.ts             # Translations (PT-BR/EN)
│   └── theme.ts            # Colors, spacing, typography
├── contexts/
│   ├── InspectionContext.tsx  # Inspection data state
│   └── LanguageContext.tsx    # Language preferences
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenInsets.ts
│   └── useTheme.ts
├── navigation/
│   ├── HomeStackNavigator.tsx
│   ├── InspectionsStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   ├── PropertiesStackNavigator.tsx
│   └── screenOptions.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── InspectionDetailScreen.tsx
│   ├── InspectionFormScreen.tsx
│   ├── InspectionsListScreen.tsx
│   ├── NewInspectionScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── PropertiesScreen.tsx
│   └── PropertyFormScreen.tsx
└── utils/
    └── checklistTemplates.ts  # NFPA 25 checklist templates
```

### Data Persistence
- Uses AsyncStorage for local data persistence
- Stores: inspections, properties, companies, language preference
- Auto-save functionality for inspection forms

### Design System
- **Primary Color**: Safety Orange (#FF6B00)
- **Secondary Color**: Deep Blue (#1A365D)
- **Success**: Forest Green (#22863A)
- **Warning**: Amber (#F59E0B)
- **Error**: Fire Red (#DC2626)
- iOS Liquid Glass design aesthetic
- Feather icons from @expo/vector-icons

## Navigation Structure
- **Bottom Tab Navigator** with 4 tabs:
  1. Home - Dashboard with stats and recent activity
  2. Inspections - List of all inspections
  3. Properties - Company and property management
  4. Profile - Settings and preferences
- **Floating Action Button** for creating new inspections

## Running the App
```bash
npm run dev
```
Scan the QR code with Expo Go (iOS/Android) or open web version at localhost:8081

## Recent Changes (November 2025)
- Implemented frequency-based checklist filtering per NFPA 25 standards
- Each checklist item now has a `frequencies` array defining when it applies (daily, weekly, monthly, quarterly, annually, five_years)
- UI updated to show all 6 frequency options when creating inspections
- Checklist automatically updates when frequency is changed for new inspections
- Existing inspections preserve their saved checklist data when editing
- Added 80+ new translation keys for comprehensive checklist coverage in PT-BR and EN

## Future Enhancements
- Cloud sync and backup with external API
- Advanced scheduling with recurring inspections
- Multi-inspector team collaboration
- Barcode/QR code scanning for equipment identification
