import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { aadhaarService } from '../src/services/aadhaar';

/**
 * Aadhaar Verification Screen
 * Two-step verification: Generate OTP → Verify OTP
 */
export default function AadhaarVerification({ email, onVerificationComplete, onSkip }) {
  const [step, setStep] = useState(1); // 1: Enter Aadhaar, 2: Enter OTP, 3: Success
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [kycData, setKycData] = useState(null);

  /**
   * Format Aadhaar number with spaces (XXXX XXXX XXXX)
   */
  const formatAadhaar = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  /**
   * Step 1: Generate OTP
   */
  const handleGenerateOTP = async () => {
    const cleanedAadhaar = aadhaarNumber.replace(/\s/g, '');

    if (cleanedAadhaar.length !== 12) {
      Alert.alert('Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    const result = await aadhaarService.generateOTP(cleanedAadhaar, email);
    setLoading(false);

    if (result.success) {
      setRefId(result.referenceId); // Updated to match backend response
      setStep(2);

      // In Mock Mode, show the test OTP
      if (result.__mockOTP) {
        Alert.alert(
          'OTP Sent (Mock Mode)',
          `Your test OTP is: ${result.__mockOTP}\n\nIn production, this will be sent to your Aadhaar-linked mobile.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'OTP Sent!',
          'Please check your Aadhaar-linked mobile number for the OTP'
        );
      }
    } else {
      Alert.alert('Error', result.message);
    }
  };

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    const result = await aadhaarService.verifyOTP(refId, otp, email); // Updated to match backend
    setLoading(false);

    if (result.success) {
      setKycData(result.data); // Updated to match backend response
      setStep(3);
      Alert.alert('Success!', 'Your Aadhaar has been verified successfully');

      // Notify parent component after 2 seconds
      setTimeout(() => {
        onVerificationComplete(result.data);
      }, 2000);
    } else {
      Alert.alert('Verification Failed', result.message);
    }
  };

  /**
   * Render Success Screen
   */
  if (step === 3 && kycData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>KYC Verified!</Text>
            <Text style={styles.successSubtitle}>Your identity has been verified</Text>

            {kycData.photo && (
              <Image
                source={{ uri: kycData.photo }}
                style={styles.photo}
                resizeMode="cover"
              />
            )}

            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycLabel}>Name:</Text>
                <Text style={styles.kycValue}>{kycData.name}</Text>
              </View>

              <View style={styles.kycRow}>
                <Text style={styles.kycLabel}>Date of Birth:</Text>
                <Text style={styles.kycValue}>{kycData.dob}</Text>
              </View>

              <View style={styles.kycRow}>
                <Text style={styles.kycLabel}>Gender:</Text>
                <Text style={styles.kycValue}>{kycData.gender === 'M' ? 'Male' : 'Female'}</Text>
              </View>

              {kycData.address && (
                <View style={styles.kycRow}>
                  <Text style={styles.kycLabel}>Address:</Text>
                  <Text style={styles.kycValue}>
                    {kycData.address.combined ||
                      `${kycData.address.house}, ${kycData.address.street}, ${kycData.address.locality}`}
                  </Text>
                </View>
              )}

              {kycData.aadhaarNumber && (
                <View style={styles.kycRow}>
                  <Text style={styles.kycLabel}>Aadhaar:</Text>
                  <Text style={styles.kycValue}>{kycData.aadhaarNumber}</Text>
                </View>
              )}
            </View>

            <Text style={styles.redirectText}>Creating your wallet...</Text>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1 ? '🔐 Aadhaar Verification' : '📱 Enter OTP'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Verify your identity with Aadhaar to continue'
              : 'Enter the OTP sent to your Aadhaar-linked mobile number'
            }
          </Text>
        </View>

        {step === 1 ? (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Aadhaar Number</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX"
              value={formatAadhaar(aadhaarNumber)}
              onChangeText={(text) => setAadhaarNumber(text.replace(/\s/g, ''))}
              keyboardType="numeric"
              maxLength={14} // 12 digits + 2 spaces
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleGenerateOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate OTP</Text>
              )}
            </TouchableOpacity>

            {onSkip && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkip}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ OTP will be sent to your Aadhaar-linked mobile number
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep(1);
                setOtp('');
              }}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ OTP is valid for 10 minutes
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    letterSpacing: 2,
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 30,
    borderWidth: 4,
    borderColor: '#10b981',
  },
  kycCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  kycRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  kycLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    width: 100,
  },
  kycValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    fontWeight: '500',
  },
  redirectText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
});
