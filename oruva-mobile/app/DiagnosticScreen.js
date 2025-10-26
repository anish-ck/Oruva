import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { ethers } from 'ethers';
import { CONTRACTS, ABIS } from '../src/config/contracts';
import { FLOW_EVM_TESTNET } from '../src/config/network';
import walletService from '../src/services/wallet';

export default function DiagnosticScreen({ onBack }) {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    async function checkOINRContract() {
        setLoading(true);
        try {
            const provider = new ethers.providers.JsonRpcProvider(FLOW_EVM_TESTNET.rpcUrl);
            const oinrContract = new ethers.Contract(CONTRACTS.oinr, ABIS.oinr, provider);

            const address = walletService.getAddress();

            // Check balance
            const balance = await oinrContract.balanceOf(address);

            // Check owner
            const owner = await oinrContract.owner();

            // Check if VaultManager has minting rights
            const vaultManagerAddress = CONTRACTS.vaultManager;

            let output = `🔍 oINR Contract Diagnostic\n\n`;
            output += `Your Address: ${address}\n\n`;
            output += `Your oINR Balance: ${ethers.utils.formatEther(balance)} oINR\n\n`;
            output += `oINR Owner: ${owner}\n`;
            output += `VaultManager: ${vaultManagerAddress}\n\n`;
            output += `Owner matches VaultManager: ${owner.toLowerCase() === vaultManagerAddress.toLowerCase() ? '✅ YES' : '❌ NO'}\n\n`;

            if (owner.toLowerCase() !== vaultManagerAddress.toLowerCase()) {
                output += `⚠️ PROBLEM FOUND!\nVaultManager does not own oINR contract.\nIt cannot mint tokens!\n\n`;
                output += `Expected owner: ${vaultManagerAddress}\n`;
                output += `Actual owner: ${owner}\n`;
            } else {
                output += `✅ oINR ownership is correct!\n`;
            }

            setResult(output);
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
        setLoading(false);
    }

    async function checkVaultEngine() {
        setLoading(true);
        try {
            const provider = new ethers.providers.JsonRpcProvider(FLOW_EVM_TESTNET.rpcUrl);
            const vaultEngineABI = [
                "function vaults(address) view returns (uint256 collateral, uint256 debt)",
                "function vaultManager() view returns (address)"
            ];
            const vaultEngine = new ethers.Contract(CONTRACTS.vaultEngine, vaultEngineABI, provider);

            const address = walletService.getAddress();

            const vault = await vaultEngine.vaults(address);
            const manager = await vaultEngine.vaultManager();

            let output = `🔍 VaultEngine Diagnostic\n\n`;
            output += `Your Vault:\n`;
            output += `Collateral: ${ethers.utils.formatUnits(vault.collateral, 6)} USDC\n`;
            output += `Debt: ${ethers.utils.formatEther(vault.debt)} oINR\n\n`;
            output += `VaultEngine Manager: ${manager}\n`;
            output += `Expected (VaultManager): ${CONTRACTS.vaultManager}\n\n`;
            output += `Manager correct: ${manager.toLowerCase() === CONTRACTS.vaultManager.toLowerCase() ? '✅ YES' : '❌ NO'}\n`;

            setResult(output);
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
        setLoading(false);
    }

    async function checkAllPermissions() {
        setLoading(true);
        try {
            const provider = new ethers.providers.JsonRpcProvider(FLOW_EVM_TESTNET.rpcUrl);
            const address = walletService.getAddress();

            // Check oINR
            const oinrContract = new ethers.Contract(CONTRACTS.oinr, ABIS.oinr, provider);
            const oinrBalance = await oinrContract.balanceOf(address);
            const oinrOwner = await oinrContract.owner();

            // Check VaultEngine
            const vaultEngineABI = [
                "function vaults(address) view returns (uint256 collateral, uint256 debt)",
                "function vaultManager() view returns (address)"
            ];
            const vaultEngine = new ethers.Contract(CONTRACTS.vaultEngine, vaultEngineABI, provider);
            const vault = await vaultEngine.vaults(address);
            const veManager = await vaultEngine.vaultManager();

            let output = `🔍 COMPLETE DIAGNOSTIC\n\n`;
            output += `=== YOUR WALLET ===\n`;
            output += `Address: ${address.substring(0, 10)}...${address.substring(38)}\n\n`;

            output += `=== oINR BALANCE ===\n`;
            output += `Balance: ${ethers.utils.formatEther(oinrBalance)} oINR\n\n`;

            output += `=== VAULT STATUS ===\n`;
            output += `Collateral: ${ethers.utils.formatUnits(vault.collateral, 6)} USDC\n`;
            output += `Debt: ${ethers.utils.formatEther(vault.debt)} oINR\n\n`;

            output += `=== PERMISSIONS ===\n`;
            output += `oINR Owner: ${oinrOwner === CONTRACTS.vaultManager ? '✅' : '❌'} ${oinrOwner.substring(0, 10)}...\n`;
            output += `VE Manager: ${veManager === CONTRACTS.vaultManager ? '✅' : '❌'} ${veManager.substring(0, 10)}...\n\n`;

            if (oinrOwner.toLowerCase() !== CONTRACTS.vaultManager.toLowerCase()) {
                output += `❌ CRITICAL: oINR owner is wrong!\n`;
                output += `Expected: ${CONTRACTS.vaultManager}\n`;
                output += `Actual: ${oinrOwner}\n\n`;
                output += `This is why you can't borrow oINR!\n`;
                output += `VaultManager can't mint without ownership.\n`;
            } else if (parseFloat(ethers.utils.formatEther(vault.debt)) > 0 &&
                parseFloat(ethers.utils.formatEther(oinrBalance)) === 0) {
                output += `❌ MISMATCH FOUND!\n`;
                output += `You have ${ethers.utils.formatEther(vault.debt)} oINR debt\n`;
                output += `But 0 oINR balance!\n\n`;
                output += `Transactions succeeded but tokens not received.\n`;
                output += `Check transaction history on explorer.\n`;
            } else {
                output += `✅ Everything looks correct!\n`;
            }

            setResult(output);
        } catch (error) {
            setResult(`Error: ${error.message}\n\n${error.stack}`);
        }
        setLoading(false);
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Diagnostic Tools</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    Use these tools to check contract permissions and balances
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={checkAllPermissions}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? '⏳ Checking...' : '🔍 Check All Permissions'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#2196F3' }]}
                    onPress={checkOINRContract}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? '⏳ Checking...' : '📄 Check oINR Contract'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#FF9800' }]}
                    onPress={checkVaultEngine}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? '⏳ Checking...' : '🏦 Check Vault Engine'}
                    </Text>
                </TouchableOpacity>

                {result ? (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultText}>{result}</Text>
                    </View>
                ) : null}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#9C27B0',
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
    content: {
        padding: 20,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resultBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    resultText: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
    },
});
