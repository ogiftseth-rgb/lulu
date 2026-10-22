import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { PageHero } from "@/components/site-footer";
import { getTeam } from "@/lib/queries";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <main>
      <PageHero title="Team" image={team[0]?.imageUrl ?? ""} />
      <section className="team-list">
        {team.map((member) => (
          <article key={member.id} className="member">
            <div className="member-photo">
              <Photo src={member.imageUrl} alt={member.name} sizes="(max-width: 800px) 100vw, 40vw" />
            </div>
            <h2>{member.name}</h2>
            <p className="text-rose">{member.role}</p>
            <p className="mt-3 leading-7">{member.bio}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
