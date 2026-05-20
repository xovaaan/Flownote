import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MeetingCard } from "@/components/meeting-card";

export default async function TrashPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userMeetings = await db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(desc(meetings.createdAt));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink-900 mb-2">Trash</h1>
        <p className="text-ink-500">Deleted meetings will appear here. (Feature coming soon)</p>
      </div>
      {userMeetings.length > 0 ? (
        <div className="grid gap-3 opacity-50">
          {userMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-granola-200 p-12 text-center"><p className="text-ink-500">No deleted meetings</p></div>
      )}
    </div>
  );
}
