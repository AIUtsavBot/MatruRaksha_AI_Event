import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabaseAuth } from '../../services/supabase';
import { colors, spacing } from '../../theme';
import { isValidEmail } from '../../utils/helpers';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
    AuthStackParamList,
    'ForgotPassword'
>;

interface Props {
    navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await supabaseAuth.resetPassword(email.trim().toLowerCase());
            setSent(true);
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to send reset email. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <Text style={styles.successEmoji}>📧</Text>
                    <Title style={styles.successTitle}>Check Your Email</Title>
                    <Text style={styles.successText}>
                        We've sent a password reset link to{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    <Text style={styles.helperText}>
                        Didn't receive the email? Check your spam folder or try again.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => setSent(false)}
                        style={styles.button}
                    >
                        Try Again
                    </Button>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.backButton}
                    >
                        Back to Login
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backLink}
                >
                    <Text style={styles.backLinkText}>← Back</Text>
                </TouchableOpacity>

                <Title style={styles.title}>Forgot Password?</Title>
                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you a link to reset your
                    password.
                </Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                    mode="outlined"
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    error={!!error}
                    left={<TextInput.Icon icon="email-outline" />}
                />
                {error && (
                    <HelperText type="error" visible={!!error}>
                        {error}
                    </HelperText>
                )}

                <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Send Reset Link
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    backLink: {
        position: 'absolute',
        top: spacing.xl,
        left: spacing.lg,
    },
    backLinkText: {
        color: colors.primary,
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    input: {
        marginBottom: spacing.xs,
        backgroundColor: colors.surface,
    },
    button: {
        marginTop: spacing.lg,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: spacing.xs,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    successEmoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    successText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.sm,
        lineHeight: 24,
    },
    emailText: {
        fontWeight: '600',
        color: colors.primary,
    },
    helperText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    backButton: {
        marginTop: spacing.sm,
    },
});
