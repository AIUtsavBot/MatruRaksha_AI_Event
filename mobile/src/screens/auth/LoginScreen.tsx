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
import { isValidEmail } from '../../utils/helpers';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<
    AuthStackParamList,
    'Login'
>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const { signIn } = useAuth();

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await signIn(email.trim().toLowerCase(), password);
            // Navigation is handled by AppNavigator based on auth state
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.message || 'Invalid email or password. Please try again.'
            );
        } finally {
            setLoading(false);
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
                {/* Logo and Title */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🤰</Text>
                    <Title style={styles.title}>MatruRaksha</Title>
                    <Text style={styles.subtitle}>Maternal Health Companion</Text>
                </View>

                {/* Login Form */}
                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors({ ...errors, email: undefined });
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
                        <HelperText type="error" visible={!!errors.email}>
                            {errors.email}
                        </HelperText>
                    )}

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors({ ...errors, password: undefined });
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
                        <HelperText type="error" visible={!!errors.password}>
                            {errors.password}
                        </HelperText>
                    )}

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Sign In
                    </Button>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Empowering Maternal Health in Rural Communities
                </Text>
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
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    emoji: {
        fontSize: 64,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.md,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 14,
    },
    loginButton: {
        marginTop: spacing.sm,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: spacing.xs,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        color: colors.textMuted,
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    signupLink: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
        marginTop: spacing.xxl,
    },
});
