export type WorkflowState = 
  | 'PENDING'
  | 'INITIAL_EMAIL_SENT'
  | 'REPLY_RECEIVED'
  | 'INTERESTED'
  | 'NO_REPLY'
  | 'FOLLOW_UP_1'
  | 'FOLLOW_UP_2'
  | 'CLOSED';

export interface SponsorRecord {
  id: string;
  companyName: string;
  state: WorkflowState;
  contactedByUserId: string | null;
  lastContactedAt: Date | null;
  followUpCount: number;
}

/**
 * Manages the Sponsor Follow-Up Workflow.
 * A pure state-transition service that enforces communication rules.
 */
export class SponsorWorkflow {
  
  /**
   * 1. Send Initial Email
   */
  static sendInitial(
    record: SponsorRecord,
    userId: string,
    isHumanApproved: boolean
  ): SponsorRecord {
    if (!isHumanApproved) {
      throw new Error('Action blocked: Human approval is required to send emails.');
    }
    if (record.state !== 'PENDING') {
      throw new Error(`Cannot send initial email. Current state is '${record.state}'.`);
    }

    return {
      ...record,
      state: 'INITIAL_EMAIL_SENT',
      contactedByUserId: userId,
      lastContactedAt: new Date(),
      followUpCount: 0,
    };
  }

  /**
   * 2. Trigger Follow-Up
   */
  static sendFollowUp(
    record: SponsorRecord,
    isHumanApproved: boolean
  ): SponsorRecord {
    if (!isHumanApproved) {
      throw new Error('Action blocked: Human approval is required to send follow-ups.');
    }

    const terminalStates: WorkflowState[] = ['REPLY_RECEIVED', 'INTERESTED', 'CLOSED'];
    if (terminalStates.includes(record.state)) {
      throw new Error(`Follow-ups stopped. Sponsor has replied or is closed (State: ${record.state}).`);
    }

    if (record.followUpCount >= 2) {
      // Max follow-ups reached. Automatically transition to CLOSED.
      console.log(`[${record.companyName}] Max follow-ups (2) reached. Closing thread.`);
      return {
        ...record,
        state: 'CLOSED',
      };
    }

    const newCount = record.followUpCount + 1;
    const newState: WorkflowState = newCount === 1 ? 'FOLLOW_UP_1' : 'FOLLOW_UP_2';

    return {
      ...record,
      state: newState,
      lastContactedAt: new Date(),
      followUpCount: newCount,
    };
  }

  /**
   * 3. Handle incoming reply
   */
  static handleReply(
    record: SponsorRecord,
    isInterested: boolean
  ): SponsorRecord {
    return {
      ...record,
      state: isInterested ? 'INTERESTED' : 'REPLY_RECEIVED',
    };
  }

  /**
   * 4. Mark as No Reply (Time elapsed without response)
   */
  static markNoReply(record: SponsorRecord): SponsorRecord {
    if (record.followUpCount >= 2 || record.state === 'FOLLOW_UP_2') {
      return { ...record, state: 'CLOSED' };
    }
    return { ...record, state: 'NO_REPLY' };
  }
}
