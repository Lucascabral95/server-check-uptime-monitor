import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface MonitorEvent {
  type: 'monitor.updated' | 'monitor.status_changed';
  monitorId: string;
  userId: string;
  workspaceId?: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
}

@Injectable()
export class EventsService {
  private readonly subject = new Subject<MonitorEvent>();
  readonly events$ = this.subject.asObservable();

  publish(event: Omit<MonitorEvent, 'occurredAt'>) {
    this.subject.next({ ...event, occurredAt: new Date().toISOString() });
  }
}
