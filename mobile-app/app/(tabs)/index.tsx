import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { loadEvents } from '../../services/api';

export default function EventsScreen() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: loadEvents,
  });

  const renderEvent = ({ item }: any) => (
    <TouchableOpacity style={styles.eventCard}>
      <Text style={styles.eventName}>{item.nama || item.mesyuarat_id}</Text>
      <Text style={styles.eventDate}>{item.tarikh ? new Date(item.tarikh).toLocaleDateString('ms-MY') : 'TBD'}</Text>
      <Text style={styles.eventLocation}>{item.tempat || 'Location TBD'}</Text>
      {item.event_type && <Text style={styles.eventType}>{item.event_type}</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading events</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.mesyuarat_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
});
