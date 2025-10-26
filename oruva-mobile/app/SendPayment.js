import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function SendPayment({ wallet, onBack, onPaymentSuccess, oINRBalance }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return;

        setScanned(true);

        try {
            const parsedData = JSON.parse(data);

            if (parsedData.type !== 'oINR_PAYMENT') {
                Alert.alert('Invalid QR Code', 'This is not a valid Oruva payment QR code.');
                setScanned(false);
                return;
            }

            setPaymentData(parsedData);
        } catch (error) {
            Alert.alert('Error', 'Could not read QR code. Please try again.');
            setScanned(false);
        }
    };

    const confirmPayment = () => {
        Alert.alert(
            'Confirm Payment',
            `Send ${paymentData.amount} oINR to:\n\n${paymentData.receiver.substring(0, 10)}...${paymentData.receiver.substring(38)}\n\nNote: ${paymentData.note}`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setScanned(false);
                        setPaymentData(null);
                    },
                },
                {
                    text: 'Pay',
                    onPress: processPayment,
                },
            ]
        );
    };

    const processPayment = async () => {
        setProcessing(true);

        try {
            // Call the payment function passed from parent
            await onPaymentSuccess(paymentData.receiver, paymentData.amount);

            Alert.alert(
                'Success',
                `Payment of ${paymentData.amount} oINR sent successfully!`,
                [
                    {
                        text: 'OK',
                        onPress: onBack,
                    },
                ]
            );
        } catch (error) {
            console.error('Payment error:', error);

            let errorMessage = 'Payment failed. Please try again.';

            if (error.message.includes('Insufficient oINR balance')) {
                errorMessage = `You don't have enough oINR!\n\nYou need ${paymentData.amount} oINR to complete this payment.\n\nPlease buy or borrow oINR first from the main screen.`;
            } else if (error.message.includes('Insufficient FLOW')) {
                errorMessage = 'Insufficient FLOW for gas fees.\n\nGet free testnet FLOW from:\nhttps://faucet.flow.com/';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Payment Failed', errorMessage);
            setScanned(false);
            setPaymentData(null);
        } finally {
            setProcessing(false);
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Send Payment</Text>
                </View>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Camera permission is required to scan QR codes</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (paymentData && !processing) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Confirm Payment</Text>
                </View>

                <View style={styles.confirmContainer}>
                    <Text style={styles.confirmTitle}>Payment Details</Text>

                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Amount</Text>
                        <Text style={styles.amountText}>{paymentData.amount} oINR</Text>
                    </View>

                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>To</Text>
                        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                            {paymentData.receiver}
                        </Text>
                    </View>

                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Note</Text>
                        <Text style={styles.noteText}>{paymentData.note}</Text>
                    </View>

                    <TouchableOpacity style={styles.confirmButton} onPress={confirmPayment}>
                        <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setScanned(false);
                            setPaymentData(null);
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (processing) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Processing Payment</Text>
                </View>
                <View style={styles.processingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.processingText}>Sending payment...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Scan QR Code</Text>
            </View>

            <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Your oINR Balance:</Text>
                <Text style={styles.balanceAmount}>{oINRBalance || '0'} oINR</Text>
                {parseFloat(oINRBalance || '0') === 0 && (
                    <Text style={styles.warningText}>
                        ⚠️ You need oINR to send payments. Buy or borrow oINR first!
                    </Text>
                )}
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    <View style={styles.overlay}>
                        <View style={styles.scanArea}>
                            <View style={[styles.corner, styles.cornerTopLeft]} />
                            <View style={[styles.corner, styles.cornerTopRight]} />
                            <View style={[styles.corner, styles.cornerBottomLeft]} />
                            <View style={[styles.corner, styles.cornerBottomRight]} />
                        </View>
                    </View>
                </CameraView>
            </View>

            <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                    Point your camera at the payment QR code
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
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
    cameraContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#4CAF50',
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    instructionContainer: {
        padding: 20,
        backgroundColor: 'white',
    },
    instructionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    balanceInfo: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 8,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#1976d2',
        marginBottom: 5,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1565c0',
    },
    warningText: {
        fontSize: 13,
        color: '#d32f2f',
        marginTop: 8,
        fontWeight: '500',
    },
    confirmContainer: {
        flex: 1,
        padding: 20,
    },
    confirmTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    detailCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    amountText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },
    noteText: {
        fontSize: 16,
        color: '#333',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    processingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingText: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
    },
});
