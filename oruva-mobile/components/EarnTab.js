/**
 * Earn Tab - Yield Vaults
 * Users can deposit USDC/oINR to earn passive 5% APY
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import yieldService from '../services/yield';
import walletService from '../services/wallet';
import usdcService from '../services/usdc';
import oinrService from '../services/oinr';
import { CONTRACTS } from '../services/../config/contracts';

export default function EarnTab() {
  const [loading, setLoading] = useState(true);
  const [vaultInfo, setVaultInfo] = useState(null);
  const [selectedVault, setSelectedVault] = useState('USDC'); // 'USDC' or 'oINR'
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [balances, setBalances] = useState({ usdc: '0', oinr: '0' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get vault info
      const info = await yieldService.getAllVaultInfo();
      setVaultInfo(info);
      
      // Get token balances
      const usdcBalance = await usdcService.getBalance();
      const oinrBalance = await oinrService.getBalance();
      setBalances({ usdc: usdcBalance, oinr: oinrBalance });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading vault data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load vault information');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const tokenService = selectedVault === 'USDC' ? usdcService : oinrService;
    const vaultAddress = selectedVault === 'USDC' 
      ? CONTRACTS.usdcYieldVault
      : CONTRACTS.oinrYieldVault;

    try {
      setProcessing(true);

      // Approve vault to spend tokens
      console.log(`Approving ${selectedVault} vault...`);
      await tokenService.approve(vaultAddress, depositAmount);

      // Deposit to vault
      console.log(`Depositing ${depositAmount} ${selectedVault}...`);
      await yieldService.deposit(selectedVault, depositAmount);

      Alert.alert(
        'Success!',
        `Deposited ${depositAmount} ${selectedVault}\nNow earning 5% APY!`
      );
      
      setDepositAmount('');
      await loadData();
    } catch (error) {
      console.error('Deposit error:', error);
      Alert.alert('Error', error.message || 'Failed to deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);

      await yieldService.withdraw(selectedVault, withdrawAmount);

      Alert.alert(
        'Success!',
        `Withdrew ${withdrawAmount} ${selectedVault}\nYield auto-claimed!`
      );
      
      setWithdrawAmount('');
      await loadData();
    } catch (error) {
      console.error('Withdraw error:', error);
      Alert.alert('Error', error.message || 'Failed to withdraw');
    } finally {
      setProcessing(false);
    }
  };

  const handleClaimYield = async () => {
    try {
      setProcessing(true);

      await yieldService.claimYield(selectedVault);

      const pendingYield = selectedVault === 'USDC' 
        ? vaultInfo.usdc.pendingYield 
        : vaultInfo.oinr.pendingYield;

      Alert.alert(
        'Success!',
        `Claimed ${parseFloat(pendingYield).toFixed(6)} ${selectedVault}!`
      );
      
      await loadData();
    } catch (error) {
      console.error('Claim yield error:', error);
      Alert.alert('Error', error.message || 'Failed to claim yield');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading vaults...</Text>
      </View>
    );
  }

  const currentVault = selectedVault === 'USDC' ? vaultInfo?.usdc : vaultInfo?.oinr;
  const currentBalance = selectedVault === 'USDC' ? balances.usdc : balances.oinr;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Earn Passive Income</Text>
        <Text style={styles.subtitle}>Deposit tokens and earn 5% APY</Text>
      </View>

      {/* Vault Selector */}
      <View style={styles.vaultSelector}>
        <TouchableOpacity
          style={[styles.vaultButton, selectedVault === 'USDC' && styles.vaultButtonActive]}
          onPress={() => setSelectedVault('USDC')}
        >
          <Text style={[styles.vaultButtonText, selectedVault === 'USDC' && styles.vaultButtonTextActive]}>
            USDC Vault
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.vaultButton, selectedVault === 'oINR' && styles.vaultButtonActive]}
          onPress={() => setSelectedVault('oINR')}
        >
          <Text style={[styles.vaultButtonText, selectedVault === 'oINR' && styles.vaultButtonTextActive]}>
            oINR Vault
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vault Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>APY</Text>
          <Text style={styles.statValue}>{currentVault?.apy || 5}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Your Deposit</Text>
          <Text style={styles.statValue}>
            {parseFloat(currentVault?.depositAmount || 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending Yield</Text>
          <Text style={styles.statValueGreen}>
            +{parseFloat(currentVault?.pendingYield || 0).toFixed(6)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Claimed</Text>
          <Text style={styles.statValue}>
            {parseFloat(currentVault?.totalClaimed || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Wallet Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance:</Text>
        <Text style={styles.balanceValue}>
          {parseFloat(currentBalance).toFixed(selectedVault === 'USDC' ? 2 : 2)} {selectedVault}
        </Text>
      </View>

      {/* Deposit Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deposit to Earn</Text>
        <TextInput
          style={styles.input}
          placeholder={`Amount to deposit (${selectedVault})`}
          value={depositAmount}
          onChangeText={setDepositAmount}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity
          style={[styles.button, processing && styles.buttonDisabled]}
          onPress={handleDeposit}
          disabled={processing}
        >
          <Text style={styles.buttonText}>
            {processing ? 'Processing...' : `Deposit ${selectedVault}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Withdraw Section */}
      {parseFloat(currentVault?.depositAmount || 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdraw (Auto-claims yield)</Text>
          <TextInput
            style={styles.input}
            placeholder={`Amount to withdraw (${selectedVault})`}
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, processing && styles.buttonDisabled]}
            onPress={handleWithdraw}
            disabled={processing}
          >
            <Text style={styles.buttonText}>
              {processing ? 'Processing...' : `Withdraw ${selectedVault}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Claim Yield Section */}
      {parseFloat(currentVault?.pendingYield || 0) > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, processing && styles.buttonDisabled]}
            onPress={handleClaimYield}
            disabled={processing}
          >
            <Text style={styles.buttonText}>
              {processing ? 'Processing...' : `Claim ${parseFloat(currentVault.pendingYield).toFixed(6)} ${selectedVault}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>
          • Deposit {selectedVault} to earn passive 5% APY
        </Text>
        <Text style={styles.infoText}>
          • Interest is calculated continuously
        </Text>
        <Text style={styles.infoText}>
          • Claim yield anytime without withdrawing
        </Text>
        <Text style={styles.infoText}>
          • Withdrawals automatically claim pending yield
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 5,
  },
  vaultSelector: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  vaultButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  vaultButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  vaultButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  vaultButtonTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statValueGreen: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  balanceCard: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#FF9800',
  },
  buttonSuccess: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 5,
  },
});
