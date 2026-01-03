import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Title,
    HelperText,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme';
import { isValidEmail, isValidPhone } from '../../utils/helpers';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type SignupScreenNavigationProp = NativeStackNavigationProp<
    AuthStackParamList,
    'Signup'
>;

interface Props {
    navigation: SignupScreenNavigationProp;
}

export default function SignupScreen({ navigation }: Props) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { signUp } = useAuth();

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (phone && !isValidPhone(phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await signUp(
                email.trim().toLowerCase(),
                password,
                fullName.trim(),
                phone.trim() || undefined
            );
            Alert.alert(
                'Registration Successful',
                'Please check your email to verify your account.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.message || 'Unable to create account. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Title style={styles.title}>Create Account</Title>
                    <Text style={styles.subtitle}>Join MatruRaksha today</Text>
                </View>

                {/* Signup Form */}
                <View style={styles.form}>
                    <TextInput
                        label="Full Name"
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            clearError('fullName');
                        }}
                        autoCapitalize="words"
                        style={styles.input}
                        mode="outlined"
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        error={!!errors.fullName}
                        left={<TextInput.Icon icon="account-outline" />}
                    />
                    {errors.fullName && (
                        <HelperText type="error">{errors.fullName}</HelperText>
                    )}

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            clearError('email');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        style={styles.input}
                        mode="outlined"
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        error={!!errors.email}
                        left={<TextInput.Icon icon="email-outline" />}
                    />
                    {errors.email && (
                        <HelperText type="error">{errors.email}</HelperText>
                    )}

                    <TextInput
                        label="Phone Number (Optional)"
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text.replace(/\D/g, '').slice(0, 10));
                            clearError('phone');
                        }}
                        keyboardType="phone-pad"
                        style={styles.input}
                        mode="outlined"
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        error={!!errors.phone}
                        left={<TextInput.Icon icon="phone-outline" />}
                    />
                    {errors.phone && (
                        <HelperText type="error">{errors.phone}</HelperText>
                    )}

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            clearError('password');
                        }}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        mode="outlined"
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        error={!!errors.password}
                        left={<TextInput.Icon icon="lock-outline" />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />
                    {errors.password && (
                        <HelperText type="error">{errors.password}</HelperText>
                    )}

                    <TextInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            clearError('confirmPassword');
                        }}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        mode="outlined"
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        error={!!errors.confirmPassword}
                        left={<TextInput.Icon icon="lock-check-outline" />}
                    />
                    {errors.confirmPassword && (
                        <HelperText type="error">{errors.confirmPassword}</HelperText>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={loading}
                        style={styles.signupButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Create Account
                    </Button>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
    },
    header: {
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    backButton: {
        marginBottom: spacing.md,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: spacing.xs,
        backgroundColor: colors.surface,
    },
    signupButton: {
        marginTop: spacing.lg,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: spacing.xs,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    loginText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    loginLink: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
});
