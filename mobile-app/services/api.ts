import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAyMzE3NDcsImV4cCI6MjAzNTgwNzM0N30.YOUR_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth helper functions
export const getAuthToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('auth_token');
};

export const getUserId = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('user_id');
};

export const clearAuth = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('auth_token');
  await SecureStore.deleteItemAsync('user_id');
};

// API functions for events
export const loadEvents = async () => {
  const { data, error } = await supabase
    .from('DPMM_MESYUARAT')
    .select('*')
    .order('tarikh', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const loadEventRSVPs = async (eventId: string) => {
  const { data, error } = await supabase
    .from('DPMM_RSVP')
    .select('*')
    .eq('event_id', eventId)
    .order('responded_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateCheckIn = async (rsvpId: number, checkInTime: string) => {
  const { data, error } = await supabase
    .from('DPMM_RSVP')
    .update({
      checked_in: true,
      check_in_time: checkInTime,
    })
    .eq('id', rsvpId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const validateAttendeeToken = async (token: string, eventId: string) => {
  const { data, error } = await supabase
    .from('DPMM_RSVP')
    .select('*')
    .eq('attendee_token', token)
    .eq('event_id', eventId)
    .single();
  
  if (error) throw error;
  return data;
};
