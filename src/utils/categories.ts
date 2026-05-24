/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'work',
    name_ar: 'عمل عميق',
    name_en: 'Deep Work',
    icon: 'Briefcase',
    color: '#D4AF37', // Elite Gold
    default_usefulness: 'useful',
  },
  {
    id: 'study',
    name_ar: 'دراسة',
    name_en: 'Study',
    icon: 'GraduationCap',
    color: '#A3862A', // Brass Gold
    default_usefulness: 'useful',
  },
  {
    id: 'reading',
    name_ar: 'قراءة',
    name_en: 'Reading',
    icon: 'BookOpen',
    color: '#C4B48A', // Champagne Gold
    default_usefulness: 'useful',
  },
  {
    id: 'youtube',
    name_ar: 'يوتيوب',
    name_en: 'YouTube',
    icon: 'Youtube',
    color: '#4F432B', // Muted Dark Wood
    default_usefulness: 'not_useful',
  },
  {
    id: 'entertainment',
    name_ar: 'ترفيه وألعاب',
    name_en: 'Entertainment',
    icon: 'Gamepad2',
    color: '#9C7721', // Dark Bronze Gold
    default_usefulness: 'not_useful',
  },
  {
    id: 'sport',
    name_ar: 'رياضة',
    name_en: 'Sport & Health',
    icon: 'Dumbbell',
    color: '#CCA31D', // Bright Warm Gold
    default_usefulness: 'useful',
  },
  {
    id: 'cooking',
    name_ar: 'طبخ وطعام',
    name_en: 'Cooking/Meals',
    icon: 'ChefHat',
    color: '#EAD088', // Light Gold
    default_usefulness: 'useful',
  },
  {
    id: 'meditation',
    name_ar: 'تأمل وتفكير',
    name_en: 'Meditation',
    icon: 'Brain',
    color: '#8F815B', // Platinum Gold
    default_usefulness: 'useful',
  },
  {
    id: 'language',
    name_ar: 'تعلم لغة',
    name_en: 'Language Learning',
    icon: 'Languages',
    color: '#B8AD8F', // Sandy Gold
    default_usefulness: 'useful',
  },
  {
    id: 'meetings',
    name_ar: 'اجتماعات',
    name_en: 'Meetings',
    icon: 'Users',
    color: '#A07F1B', // Antique Gold
    default_usefulness: 'useful',
  },
  {
    id: 'calls',
    name_ar: 'مكالمات',
    name_en: 'Calls & Comms',
    icon: 'PhoneCall',
    color: '#E5D5B0', // Soft Champagne
    default_usefulness: 'useful',
  },
  {
    id: 'transit',
    name_ar: 'تنقل ومواصلات',
    name_en: 'Transit & Commute',
    icon: 'MapPin',
    color: '#625126', // Ochre Bronze
    default_usefulness: 'not_useful',
  },
  {
    id: 'sleep',
    name_ar: 'نوم',
    name_en: 'Sleep',
    icon: 'Moon',
    color: '#373327', // Charcoal Gold
    default_usefulness: 'useful',
  },
  {
    id: 'break',
    name_ar: 'استراحة',
    name_en: 'Break / Rest',
    icon: 'Coffee',
    color: '#A89F82', // Soft Sage-Gray Gold
    default_usefulness: 'useful',
  },
  {
    id: 'social',
    name_ar: 'سوشيال ميديا',
    name_en: 'Social Media',
    icon: 'Share2',
    color: '#5E5133', // Sandy Dark Bronze
    default_usefulness: 'not_useful',
  },
  {
    id: 'uncategorized',
    name_ar: 'غير مصنف',
    name_en: 'Uncategorized',
    icon: 'HelpCircle',
    color: '#8A7B5F', // Muted Clay Gold
    default_usefulness: 'not_useful',
  },
];
