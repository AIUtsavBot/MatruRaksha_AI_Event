import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiClient from '../api/client';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Push notification service for handling remote and local notifications
 */
export const notificationService = {
    /**
     * Register for push notifications and get the push token
     */
    registerForPushNotifications: async (): Promise<string | null> => {
        // Push notifications only work on physical devices
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return null;
        }

        try {
            // Check existing permissions
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push notification permissions');
                return null;
            }

            // Get Expo push token
            const token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId: 'your-eas-project-id', // Replace with your EAS project ID
                })
            ).data;

            console.log('Push token:', token);

            // Configure Android channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#10B981',
                });

                await Notifications.setNotificationChannelAsync('emergency', {
                    name: 'Emergency Alerts',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 500, 250, 500],
                    lightColor: '#EF4444',
                    sound: 'default',
                });

                await Notifications.setNotificationChannelAsync('reminders', {
                    name: 'Health Reminders',
                    importance: Notifications.AndroidImportance.DEFAULT,
                    vibrationPattern: [0, 250],
                    lightColor: '#10B981',
                });
            }

            return token;
        } catch (error) {
            console.error('Failed to register for push notifications:', error);
            return null;
        }
    },

    /**
     * Register push token with backend
     */
    registerTokenWithBackend: async (pushToken: string): Promise<void> => {
        try {
            await apiClient.post('/notifications/register-device', {
                push_token: pushToken,
                platform: Platform.OS,
                device_name: Device.deviceName,
            });
            console.log('Push token registered with backend');
        } catch (error) {
            console.error('Failed to register push token with backend:', error);
        }
    },

    /**
     * Schedule a local notification
     */
    scheduleLocalNotification: async (
        title: string,
        body: string,
        trigger: Date | number, // Date object or seconds from now
        data?: object
    ): Promise<string> => {
        const notificationTrigger =
            typeof trigger === 'number'
                ? { seconds: trigger }
                : { date: trigger };

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: true,
            },
            trigger: notificationTrigger,
        });

        console.log('Scheduled notification:', notificationId);
        return notificationId;
    },

    /**
     * Schedule daily health check-in reminder
     */
    scheduleDailyReminder: async (hour: number = 8, minute: number = 0): Promise<string> => {
        // Cancel existing daily reminders first
        await notificationService.cancelAllScheduledNotifications();

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌅 Good Morning!',
                body: "It's time for your daily health check-in. How are you feeling today?",
                data: { type: 'daily_checkin' },
                sound: true,
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });

        console.log('Scheduled daily reminder:', notificationId);
        return notificationId;
    },

    /**
     * Schedule medication reminder
     */
    scheduleMedicationReminder: async (
        medicineName: string,
        hour: number,
        minute: number
    ): Promise<string> => {
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '💊 Medication Reminder',
                body: `Time to take your ${medicineName}`,
                data: { type: 'medication', medicine: medicineName },
                sound: true,
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });

        console.log('Scheduled medication reminder:', notificationId);
        return notificationId;
    },

    /**
     * Show immediate notification
     */
    showNotification: async (
        title: string,
        body: string,
        data?: object
    ): Promise<void> => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: true,
            },
            trigger: null, // Immediate
        });
    },

    /**
     * Cancel a specific scheduled notification
     */
    cancelNotification: async (notificationId: string): Promise<void> => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('Cancelled notification:', notificationId);
    },

    /**
     * Cancel all scheduled notifications
     */
    cancelAllScheduledNotifications: async (): Promise<void> => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('Cancelled all scheduled notifications');
    },

    /**
     * Get all scheduled notifications
     */
    getScheduledNotifications: async (): Promise<
        Notifications.NotificationRequest[]
    > => {
        return Notifications.getAllScheduledNotificationsAsync();
    },

    /**
     * Add notification received listener
     */
    addNotificationReceivedListener: (
        callback: (notification: Notifications.Notification) => void
    ): Notifications.Subscription => {
        return Notifications.addNotificationReceivedListener(callback);
    },

    /**
     * Add notification response listener (when user taps notification)
     */
    addNotificationResponseListener: (
        callback: (response: Notifications.NotificationResponse) => void
    ): Notifications.Subscription => {
        return Notifications.addNotificationResponseReceivedListener(callback);
    },

    /**
     * Get badge count
     */
    getBadgeCount: async (): Promise<number> => {
        return Notifications.getBadgeCountAsync();
    },

    /**
     * Set badge count
     */
    setBadgeCount: async (count: number): Promise<void> => {
        await Notifications.setBadgeCountAsync(count);
    },

    /**
     * Clear badge
     */
    clearBadge: async (): Promise<void> => {
        await Notifications.setBadgeCountAsync(0);
    },
};

export default notificationService;
