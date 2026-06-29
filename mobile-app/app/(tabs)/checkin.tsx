import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { validateAttendeeToken, updateCheckIn } from '../../services/api';

export default function CheckInScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendee, setAttendee] = useState<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      // Parse QR code content (format: event_id:attendee_token)
      const [eventId, token] = data.split(':');
      
      if (!eventId || !token) {
        Alert.alert('Invalid QR Code', 'Please scan a valid attendee QR code');
        setScanned(false);
        setLoading(false);
        return;
      }

      // Validate token against Supabase
      const attendeeData = await validateAttendeeToken(token, eventId);
      
      if (!attendeeData) {
        Alert.alert('Invalid Token', 'This attendee token is not valid');
        setScanned(false);
        setLoading(false);
        return;
      }

      setAttendee(attendeeData);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualToken.trim()) {
      Alert.alert('Error', 'Please enter a token');
      return;
    }

    setLoading(true);
    try {
      // For manual entry, we'll need to know the event ID
      // This is a simplified version - in production, you'd select the event first
      Alert.alert('Info', 'Please select an event first from the Events tab');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckIn = async () => {
    if (!attendee) return;

    setLoading(true);
    try {
      await updateCheckIn(attendee.id, new Date().toISOString());
      Alert.alert('Success', `${attendee.attendee_name} checked in successfully!`);
      setAttendee(null);
      setScanned(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setAttendee(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  if (attendee) {
    return (
      <View style={styles.container}>
        <View style={styles.attendeeCard}>
          <Text style={styles.attendeeName}>{attendee.attendee_name}</Text>
          <Text style={styles.attendeeType}>
            {attendee.attendee_type === 'member' ? 'Member' : 'Non-Member'}
          </Text>
          <Text style={styles.attendeeStatus}>
            Status: {attendee.status}
          </Text>
          {attendee.checked_in ? (
            <Text style={styles.alreadyCheckedIn}>Already checked in</Text>
          ) : (
            <>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmCheckIn}>
                <Text style={styles.buttonText}>Confirm Check-In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={resetScanner}>
                <Text style={styles.buttonText}>Scan Another</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      {scanned && (
        <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.manualSection}>
        <Text style={styles.manualTitle}>Or enter token manually:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter attendee token"
          value={manualToken}
          onChangeText={setManualToken}
        />
        <TouchableOpacity style={styles.button} onPress={handleManualCheckIn}>
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    minHeight: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#64748B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  attendeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendeeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  attendeeType: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  attendeeStatus: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  alreadyCheckedIn: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  manualSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});
