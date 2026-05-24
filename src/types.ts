/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UsefulnessStatus = 'useful' | 'not_useful';

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  icon: string; // Lucide icon key
  color: string; // hex or Tailwind color value
  default_usefulness: UsefulnessStatus;
}

export interface TimeEntry {
  id: string;
  title: string;
  category_id: string;
  start_time: string; // ISO string 2026-05-23T14:00:00Z
  end_time: string;   // ISO string 2026-05-23T15:30:00Z
  duration_minutes: number;
  note?: string;
  usefulness_status?: UsefulnessStatus;
  icon: string; // cached icon name
  color: string; // cached color hex
  created_at: string;
  updated_at: string;
}

export interface ActiveTimer {
  start_time: string; // ISO string when the timer started
  accumulated_seconds: number; // For handeling pauses
  is_running: boolean;
  title: string;
  category_id: string;
  usefulness_status?: UsefulnessStatus;
  note: string;
}

export interface UserStats {
}
