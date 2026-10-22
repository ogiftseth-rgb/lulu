import type { Metadata } from "next";
import { updateBespokeStatus } from "@/app/admin/actions";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Requests · Admin" };

const statuses = ["New Request", "Consultation booked", "In production", "Ready for fitting", "Completed"];

export default async function AdminRequestsPage() {
  const [bespoke, enquiries, subscribers] = await Promise.all([
    db().from("glam_bespoke_requests").select("*").order("created_at", { ascending: false }),
    db().from("glam_enquiries").select("*").order("created_at", { ascending: false }),
    db().from("glam_subscribers").select("email, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <section className="space-y-12">
      <div>
        <h2 className="font-display text-4xl">Bespoke</h2>
        {(bespoke.data ?? []).length === 0 && <p className="mt-3">No bespoke requests yet.</p>}
        <div className="mt-4 space-y-6">
          {(bespoke.data ?? []).map((request) => (
            <article key={request.id} className="border-t border-champagne pt-4">
              <h3 className="font-display text-2xl">{request.outfit_type}</h3>
              <p className="text-sm">{request.name} · {request.email} · {request.phone}</p>
              <p className="mt-2 text-sm leading-6">
                {request.occasion} · {request.event_date} · {request.colours} · budget {request.budget}
              </p>
              {request.measurements && <p className="mt-1 text-sm">{request.measurements}</p>}
              {request.notes && <p className="mt-1 text-sm">{request.notes}</p>}
              <form action={updateBespokeStatus} className="mt-3 flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={request.id} />
                <select name="status" defaultValue={request.status} aria-label={`${request.name} bespoke status`}>
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button className="rounded-full bg-burgundy px-4 py-2 text-sm text-ivory">Update request</button>
              </form>
            </article>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-4xl">Enquiries</h2>
        {(enquiries.data ?? []).length === 0 && <p className="mt-3">No messages yet.</p>}
        <div className="mt-4 space-y-5">
          {(enquiries.data ?? []).map((enquiry) => (
            <article key={enquiry.id} className="border-t border-champagne pt-4">
              <h3 className="font-display text-2xl">{enquiry.subject}</h3>
              <p className="text-sm">{enquiry.name} · {enquiry.email} · {enquiry.phone}</p>
              <p className="mt-2 leading-7">{enquiry.message}</p>
            </article>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-4xl">Newsletter</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(subscribers.data ?? []).length === 0 && <li>No subscribers yet.</li>}
          {(subscribers.data ?? []).map((subscriber) => (
            <li key={subscriber.email}>{subscriber.email}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
