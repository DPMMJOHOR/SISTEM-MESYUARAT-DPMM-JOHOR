import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { loadEventRSVPs } from '../../services/api';

export default function AttendanceDashboardScreen() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // For now, we'll use a hardcoded event ID
  // In production, this would come from event selection
  const eventId = selectedEventId || 'default_event';

  const { data: rsvps, isLoading, error } = useQuery({
    queryKey: ['rsvps', eventId],
    queryFn: () => loadEventRSVPs(eventId),
    enabled: !!eventId,
  });

  const stats = React.useMemo(() => {
    if (!rsvps) return { confirmed: 0, declined: 0, tentative: 0, pending: 0, checkedIn: 0, total: 0 };
    
    return {
      confirmed: rsvps.filter((r: any) => r.status === 'confirmed').length,
      declined: rsvps.filter((r: any) => r.status === 'declined').length,
      tentative: rsvps.filter((r: any) => r.status === 'tentative').length,
      pending: rsvps.filter((r: any) => r.status === 'pending').length,
      checkedIn: rsvps.filter((r: any) => r.checked_in).length,
      total: rsvps.length,
    };
  }, [rsvps]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading attendance data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Attendance Dashboard</Text>
        
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statGreen]}>
            <Text style={styles.statValue}>{stats.confirmed}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={[styles.statCard, styles.statRed]}>
            <Text style={styles.statValue}>{stats.declined}</Text>
            <Text style={styles.statLabel}>Declined</Text>
          </View>
          <View style={[styles.statCard, styles.statAmber]}>
            <Text style={styles.statValue}>{stats.tentative}</Text>
            <Text style={styles.statLabel}>Tentative</Text>
          </View>
          <View style={[styles.statCard, styles.statSlate]}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statBlue]}>
            <Text style={styles.statValue}>{stats.checkedIn}</Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </View>
          <View style={[styles.statCard, styles.statPurple]}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Attendance List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Attendee List</Text>
          {rsvps && rsvps.length > 0 ? (
            rsvps.map((rsvp: any) => (
              <View key={rsvp.id} style={styles.attendeeCard}>
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeName}>{rsvp.attendee_name}</Text>
                  <Text style={styles.attendeeType}>
                    {rsvp.attendee_type === 'member' ? 'Member' : 'Non-Member'}
                  </Text>
                </View>
                <View style={styles.attendeeStatus}>
                  <View style={[
                    styles.statusBadge,
                    rsvp.status === 'confirmed' && styles.statusConfirmed,
                    rsvp.status === 'declined' && styles.statusDeclined,
                    rsvp.status === 'tentative' && styles.statusTentative,
                    rsvp.status === 'pending' && styles.statusPending,
                  ]}>
                    <Text style={styles.statusText}>{rsvp.status}</Text>
                  </View>
                  {rsvp.checked_in && (
                    <View style={styles.checkedInBadge}>
                      <Text style={styles.checkedInText}>✓ Checked In</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No attendees found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGreen: {
    borderTopWidth: 4,
    borderTopColor: '#16A34A',
  },
  statRed: {
    borderTopWidth: 4,
    borderTopColor: '#DC2626',
  },
  statAmber: {
    borderTopWidth: 4,
    borderTopColor: '#F59E0B',
  },
  statSlate: {
    borderTopWidth: 4,
    borderTopColor: '#64748B',
  },
  statBlue: {
    borderTopWidth: 4,
    borderTopColor: '#2563EB',
  },
  statPurple: {
    borderTopWidth: 4,
    borderTopColor: '#7C3AED',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  attendeeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  attendeeType: {
    fontSize: 14,
    color: '#64748B',
  },
  attendeeStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusTentative: {
    backgroundColor: '#FEF3C7',
  },
  statusPending: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  checkedInBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checkedInText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
