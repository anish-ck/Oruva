import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function ReceivePayment({ walletAddress, onBack }) {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [qrData, setQrData] = useState(null);

    const generateQR = () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        // Create payment request data
        const paymentRequest = {
            type: 'oINR_PAYMENT',
            receiver: walletAddress,
            amount: amount,
            note: note || 'Payment request',
            timestamp: Date.now(),
        };

        setQrData(JSON.stringify(paymentRequest));
    };

    const resetQR = () => {
        setQrData(null);
        setAmount('');
        setNote('');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Receive Payment</Text>
            </View>

            {!qrData ? (
                <View style={styles.formContainer}>
                    <Text style={styles.subtitle}>Create Payment Request</Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Your Address:</Text>
                        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                            {walletAddress}
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (oINR)</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Note (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={note}
                            onChangeText={setNote}
                            placeholder="What's this payment for?"
                            placeholderTextColor="#999"
                            maxLength={50}
                        />
                    </View>

                    <TouchableOpacity style={styles.generateButton} onPress={generateQR}>
                        <Text style={styles.generateButtonText}>Generate QR Code</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.qrContainer}>
                    <Text style={styles.subtitle}>Scan to Pay</Text>

                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={qrData}
                            size={250}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>

                    <View style={styles.paymentDetails}>
                        <Text style={styles.amountText}>{amount} oINR</Text>
                        {note && <Text style={styles.noteText}>{note}</Text>}
                    </View>

                    <Text style={styles.instructionText}>
                        Ask the payer to scan this QR code with the Oruva app
                    </Text>

                    <TouchableOpacity style={styles.resetButton} onPress={resetQR}>
                        <Text style={styles.resetButtonText}>Create New Request</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 40,
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    formContainer: {
        padding: 20,
    },
    qrContainer: {
        padding: 20,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    generateButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    generateButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    qrWrapper: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    paymentDetails: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        width: '100%',
        marginBottom: 20,
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
        textAlign: 'center',
    },
    noteText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    resetButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        width: '100%',
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
