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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Success Header */}
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="check-circle" size={64} color="#fff" />
            <Text style={styles.title}>KYC Verified!</Text>
            <Text style={styles.subtitle}>Your identity has been verified</Text>
          </LinearGradient>

          <View style={styles.successContent}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#002E6E', '#00509E']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name={step === 1 ? "shield-check" : "message-text"}
            size={48}
            color="#fff"
          />
          <Text style={styles.title}>
            {step === 1 ? 'Aadhaar Verification' : 'Enter OTP'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Verify your identity to continue'
              : 'Enter the OTP sent to your mobile'
            }
          </Text>
        </LinearGradient>

        {step === 1 ? (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Aadhaar Number</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX"
              placeholderTextColor="#999"
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
              <LinearGradient
                colors={loading ? ['#9ca3af', '#9ca3af'] : ['#00BAF2', '#0086C9']}
                style={styles.buttonInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Generate OTP</Text>
                )}
              </LinearGradient>
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
              <MaterialCommunityIcons name="information" size={16} color="#1565C0" />
              <Text style={styles.infoText}>
                OTP will be sent to your Aadhaar-linked mobile number
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#999"
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
              <LinearGradient
                colors={loading ? ['#9ca3af', '#9ca3af'] : ['#00BAF2', '#0086C9']}
                style={styles.buttonInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </LinearGradient>
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
              <MaterialCommunityIcons name="clock-outline" size={16} color="#1565C0" />
              <Text style={styles.infoText}>
                OTP is valid for 10 minutes
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    color: '#333',
    letterSpacing: 2,
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    color: '#333',
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    padding: 18,
    alignItems: 'center',
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
    color: '#00BAF2',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    flex: 1,
  },
  successContent: {
    padding: 20,
    alignItems: 'center',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 24,
    borderWidth: 3,
    borderColor: '#4CAF50',
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
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  kycValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  redirectText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});
