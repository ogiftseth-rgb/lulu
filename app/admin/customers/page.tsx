import type { Metadata } from "next";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Customers · Admin" };

export default async function AdminCustomersPage() {
  const { data } = await db()
    .from("glam_users")
    .select("id, first_name, last_name, email, phone, role, is_demo, created_at")
    .order("created_at", { ascending: false });
  const people = data ?? [];
  return (
    <section>
      <p className="mb-6 max-w-2xl">Accounts that can sign in. Demo rows are labelled so a later catalogue reset can tell them apart from people who registered themselves.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-2 font-medium">Name</th>
              <th className="font-medium">Email</th>
              <th className="font-medium">Phone</th>
              <th className="font-medium">Role</th>
              <th className="font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-t border-champagne">
                <td className="py-3">{person.first_name} {person.last_name}{person.is_demo ? " · demo" : ""}</td>
                <td>{person.email}</td>
                <td>{person.phone}</td>
                <td className="capitalize">{person.role.replaceAll("_", " ").toLowerCase()}</td>
                <td>{new Date(person.created_at).toLocaleDateString("en-KE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
