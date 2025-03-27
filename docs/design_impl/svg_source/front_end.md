# Frontend

## 1. Overview
This document provides a detailed technical guide for implementing the frontend of the Kaiju Academy web application using React and Material-UI (MUI). The UI follows a modern dashboard layout, displaying analytics, course information, and user activities.

## 2. Component Breakdown

### Layout Components
- **Navbar**: Top navigation bar with profile dropdown.
- **Sidebar**: Collapsible sidebar with navigation links.
- **Footer**: Contains contact and quick links.

### Dashboard Page 
- **Welcome Section**: Displays user greeting.
- **Statistics Cards**: Uses Card from MUI to show user analytics.
- **Line Chart (Hours Spent)**: Implemented using recharts or MUI’s Chart components.
- **Pie Chart (Course Progress)**: Uses recharts for visualization.
- **Featured Courses Section**: Grid layout using Card components.
- **Upcoming Calendar**: Uses `@mui/lab/DateCalendar` for date display.

## 3. MUI Components & Styling

### MUI Components Used:
- **AppBar, Toolbar, Drawer**: For navigation.
- **Card, CardContent, CardMedia**: For course and statistic cards.
- **Grid, Box, Container**: For responsive layouts.
- **Typography**: For text styling.
- **Button, IconButton**: For interactive elements.
- **CircularProgress, LinearProgress**: For loading states.
- **Table, TableHead, TableRow, TableCell**: For tabular data.

## 4. State Management

- **User Authentication State**: Stored in React Context.
- **Course Data & Analytics**: Fetched via API and stored using `useState`.
- **Sidebar Open/Close**: Handled via React state.