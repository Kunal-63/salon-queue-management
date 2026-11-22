import type { Barber, QueueEntry, Service, ReviewEntry } from '../types'

export const SERVICES: Service[] = [
  { id: 'classic-cut', name_en: 'Classic Cut', name_hi: 'क्लासिक कट', icon: '✂️', duration: 25, price: 299 },
  { id: 'beard-sculpt', name_en: 'Beard Sculpt', name_hi: 'बियर्ड स्कल्प्ट', icon: '🧔', duration: 20, price: 199 },
  { id: 'royal-fade', name_en: 'Royal Fade', name_hi: 'रॉयल फेड', icon: '👑', duration: 35, price: 449 },
  { id: 'kids-cut', name_en: 'Kids Cut', name_hi: 'बच्चों का कट', icon: '🧒', duration: 20, price: 199 },
  { id: 'head-spa', name_en: 'Head Spa', name_hi: 'हेड स्पा', icon: '🌿', duration: 45, price: 599 },
  { id: 'bridal', name_en: 'Bridal Styling', name_hi: 'ब्राइडल स्टाइलिंग', icon: '💍', duration: 90, price: 1499 },
]

export const INITIAL_BARBERS: Barber[] = [
  { id: 'zara', name: 'Zara', specialty: 'Bridal & Head Spa', status: 'available', avatar: 'Z', queue_count: 2, served_today: 7, avg_duration: 32 },
  { id: 'marcus', name: 'Marcus', specialty: 'Royal Fade & Classic', status: 'available', avatar: 'M', queue_count: 3, served_today: 9, avg_duration: 28 },
  { id: 'dev', name: 'Dev', specialty: 'Beard & Kids', status: 'break', avatar: 'D', queue_count: 1, served_today: 6, avg_duration: 25 },
]

export const INITIAL_REVIEWS: ReviewEntry[] = [
  { id: 'rev-1', token: 'LX-00', customer_name: 'Aditi V.', barber_id: 'zara', barber_name: 'Zara', service: 'Head Spa', rating: 5, comment: 'Absolutely divine head spa treatment. Zara is a master of relaxation.', created_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'rev-2', token: 'LX-00b', customer_name: 'Rohan K.', barber_id: 'marcus', barber_name: 'Marcus', service: 'Royal Fade', rating: 5, comment: 'Cleanest low fade in town. Sharp lines and great conversation.', created_at: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 'rev-3', token: 'LX-00c', customer_name: 'Tanvi M.', barber_id: 'dev', barber_name: 'Dev', service: 'Beard Sculpt', rating: 4, comment: 'Very gentle and precise with the razor. Highly recommend Dev.', created_at: new Date(Date.now() - 140 * 60000).toISOString() },
  { id: 'rev-4', token: 'LX-00d', customer_name: 'Siddharth P.', barber_id: 'marcus', barber_name: 'Marcus', service: 'Classic Cut', rating: 5, comment: 'No wait, seated immediately. Pristine salon lounge ambiance.', created_at: new Date(Date.now() - 210 * 60000).toISOString() },
]

export const SAMPLE_QUEUE: QueueEntry[] = [
  { id: '1', token: 'LX-01', customer_name: 'Priya', service: 'Royal Fade', service_duration: 35, barber_id: 'zara', barber_name: 'Zara', status: 'serving', position: 1, timestamp_joined: new Date(Date.now() - 40 * 60000), timestamp_called: new Date(Date.now() - 5 * 60000), estimated_wait: 0, language: 'en' },
  { id: '2', token: 'LX-02', customer_name: 'Rahul', service: 'Classic Cut', service_duration: 25, barber_id: 'marcus', barber_name: 'Marcus', status: 'serving', position: 1, timestamp_joined: new Date(Date.now() - 35 * 60000), timestamp_called: new Date(Date.now() - 8 * 60000), estimated_wait: 0, language: 'hi' },
  { id: '3', token: 'LX-03', customer_name: 'Aisha', service: 'Head Spa', service_duration: 45, barber_id: 'zara', barber_name: 'Zara', status: 'waiting', position: 2, timestamp_joined: new Date(Date.now() - 25 * 60000), estimated_wait: 30, language: 'en' },
  { id: '4', token: 'LX-04', customer_name: 'Kabir', service: 'Beard Sculpt', service_duration: 20, barber_id: 'marcus', barber_name: 'Marcus', status: 'waiting', position: 2, timestamp_joined: new Date(Date.now() - 20 * 60000), estimated_wait: 20, language: 'hi' },
  { id: '5', token: 'LX-05', customer_name: 'Meera', service: 'Kids Cut', service_duration: 20, barber_id: 'dev', barber_name: 'Dev', status: 'waiting', position: 1, timestamp_joined: new Date(Date.now() - 15 * 60000), estimated_wait: 25, language: 'en' },
  { id: '6', token: 'LX-06', customer_name: 'Arjun', service: 'Royal Fade', service_duration: 35, barber_id: 'zara', barber_name: 'Zara', status: 'waiting', position: 3, timestamp_joined: new Date(Date.now() - 10 * 60000), estimated_wait: 65, language: 'en' },
  { id: '7', token: 'LX-07', customer_name: 'Nisha', service: 'Classic Cut', service_duration: 25, barber_id: 'marcus', barber_name: 'Marcus', status: 'waiting', position: 3, timestamp_joined: new Date(Date.now() - 5 * 60000), estimated_wait: 45, language: 'hi' },
]

export const getWaitTime = (position: number, barberAvgDuration: number) =>
  Math.max(0, (position - 1) * barberAvgDuration)

export const formatWait = (minutes: number): string => {
  if (minutes === 0) return "It's your turn!"
  if (minutes < 60) return `~${minutes} min`
  return `~${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export const generateToken = (count: number): string =>
  `LX-${String(count).padStart(2, '0')}`
