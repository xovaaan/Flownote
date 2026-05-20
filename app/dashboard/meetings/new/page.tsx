import { MeetingRecorder } from "@/components/meeting-recorder";

export const metadata = { title: "New Meeting — Granola Web" };

export default function NewMeetingPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-ink-900 mb-6">New Meeting</h1>
      <MeetingRecorder />
    </div>
  );
}
