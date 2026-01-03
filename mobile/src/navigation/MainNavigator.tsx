import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

// Mother Screens
import MotherHomeScreen from '../screens/mother/HomeScreen';
import CheckInScreen from '../screens/mother/CheckInScreen';
import TimelineScreen from '../screens/mother/TimelineScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

// Doctor Screens
import DoctorDashboardScreen from '../screens/doctor/DashboardScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';

// ASHA Screens
import AshaMotherListScreen from '../screens/asha/MotherListScreen';
import AshaVisitScreen from '../screens/asha/VisitScreen';

// Common Screens
import SettingsScreen from '../screens/common/SettingsScreen';

// Tab param lists
export type MotherTabParamList = {
    Home: undefined;
    CheckIn: undefined;
    Timeline: undefined;
    Profile: undefined;
};

export type DoctorTabParamList = {
    Dashboard: undefined;
    Patients: undefined;
    Profile: undefined;
};

export type AshaTabParamList = {
    Mothers: undefined;
    Visits: undefined;
    Profile: undefined;
};

// Stack param lists
export type MainStackParamList = {
    Tabs: undefined;
    PatientDetail: { motherId: number };
    Settings: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Mother Tab Navigator
function MotherTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;
                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'CheckIn':
                            iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
                            break;
                        case 'Timeline':
                            iconName = focused ? 'chart-timeline-variant' : 'chart-timeline-variant';
                            break;
                        case 'Profile':
                            iconName = focused ? 'account' : 'account-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen name="Home" component={MotherHomeScreen} options={{ title: 'Home' }} />
            <Tab.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Check-In' }} />
            <Tab.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Timeline' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

// Doctor Tab Navigator
function DoctorTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;
                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                            break;
                        case 'Patients':
                            iconName = focused ? 'account-group' : 'account-group-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'account' : 'account-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.roleDoctor,
                tabBarInactiveTintColor: colors.textMuted,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DoctorDashboardScreen} options={{ title: 'Dashboard' }} />
            <Tab.Screen name="Patients" component={AshaMotherListScreen} options={{ title: 'Patients' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

// ASHA Tab Navigator
function AshaTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;
                    switch (route.name) {
                        case 'Mothers':
                            iconName = focused ? 'account-group' : 'account-group-outline';
                            break;
                        case 'Visits':
                            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'account' : 'account-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.roleAsha,
                tabBarInactiveTintColor: colors.textMuted,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Mothers" component={AshaMotherListScreen} options={{ title: 'Mothers' }} />
            <Tab.Screen name="Visits" component={AshaVisitScreen} options={{ title: 'Visits' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

// Get tabs based on user role
function RoleBasedTabs() {
    const { profile } = useAuth();

    switch (profile?.role) {
        case 'DOCTOR':
            return <DoctorTabs />;
        case 'ASHA_WORKER':
            return <AshaTabs />;
        default:
            return <MotherTabs />;
    }
}

// Main Navigator with Stack
export function MainNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Tabs" component={RoleBasedTabs} />
            <Stack.Screen
                name="PatientDetail"
                component={PatientDetailScreen}
                options={{
                    headerShown: true,
                    title: 'Patient Details',
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.textOnPrimary,
                }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    headerShown: true,
                    title: 'Settings',
                }}
            />
        </Stack.Navigator>
    );
}

export default MainNavigator;
