/**
 * Queue Rules Module — The Single Source of Truth for Queue Logic
 *
 * Rules:
 * 1. Statuses: waiting -> called -> in_chair -> done. (Never backwards)
 *    waiting -> cancelled. called -> no_show.
 * 2. First come, first served.
 * 3. Call next for barber X picks the earliest customer who chose X or 'Any'.
 * 4. A customer who chose Ravi is never given to another barber.
 * 5. A barber has only one customer in the chair at a time.
 * 6. Waiting time ≈ total minutes of services ahead ÷ barbers working.
 * 7. One active spot per phone number.
 * 8. Called but not here in 10 min -> receptionist can mark No-show;
 *    if they arrive later, they're added again at the END with a new token.
 */

export const QUEUE_STATUSES = {
  WAITING: 'waiting',
  CALLED: 'called',
  IN_CHAIR: 'in_chair',
  DONE: 'done',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const ALLOWED_TRANSITIONS = {
  [QUEUE_STATUSES.WAITING]: [QUEUE_STATUSES.CALLED, QUEUE_STATUSES.CANCELLED],
  [QUEUE_STATUSES.CALLED]: [QUEUE_STATUSES.IN_CHAIR, QUEUE_STATUSES.NO_SHOW],
  [QUEUE_STATUSES.IN_CHAIR]: [QUEUE_STATUSES.DONE],
  [QUEUE_STATUSES.DONE]: [],
  [QUEUE_STATUSES.CANCELLED]: [],
  [QUEUE_STATUSES.NO_SHOW]: [],
};

/**
 * Validates whether a status transition is permitted
 */
export function isValidStatusTransition(currentStatus, newStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

/**
 * Checks if a phone number already has an active spot in the queue
 */
export function hasActiveSpot(existingCustomerList, phone) {
  const normalizedPhone = String(phone).trim();
  return existingCustomerList.some(c => 
    c.phone === normalizedPhone && 
    [QUEUE_STATUSES.WAITING, QUEUE_STATUSES.CALLED, QUEUE_STATUSES.IN_CHAIR].includes(c.status)
  );
}

/**
 * Picks the next eligible customer for a specific barber.
 * Rule: FCFS. Picks the earliest waiting customer who chose barberName or 'Any' (or null).
 * A customer who chose another barber is skipped!
 */
export function pickNextCustomerForBarber(waitingCustomers, barberName) {
  return waitingCustomers.find(c => {
    if (c.status !== QUEUE_STATUSES.WAITING) return false;
    const pref = c.preferred_barber ? c.preferred_barber.trim().toLowerCase() : 'any';
    return pref === 'any' || pref === barberName.trim().toLowerCase();
  }) || null;
}

/**
 * Calculates waiting time in minutes.
 * Rule: Waiting time ≈ total minutes of services ahead ÷ barbers working.
 */
export function calculateEstimatedWait(totalMinutesAhead, barbersWorkingCount) {
  const working = Math.max(Number(barbersWorkingCount) || 1, 1);
  return Math.ceil(totalMinutesAhead / working);
}

/**
 * Computes queue positions and estimated wait times for all waiting customers.
 * Customers ahead are those before the given customer in FCFS order.
 */
export function annotateQueueWithWaitTimes(waitingList, barbersWorkingCount) {
  const working = Math.max(Number(barbersWorkingCount) || 1, 1);
  let accumulatedMinutes = 0;

  return waitingList.map((customer, index) => {
    const serviceMinutes = Number(customer.total_duration) || 30;
    const estimatedWait = Math.ceil(accumulatedMinutes / working);
    accumulatedMinutes += serviceMinutes;

    return {
      ...customer,
      position: index + 1,
      estimated_wait: estimatedWait,
      is_next: index === 0,
      is_second: index === 1,
    };
  });
}
