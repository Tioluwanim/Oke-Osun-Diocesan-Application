import Image from 'next/image';
import { ClergyMember } from '@/types';

export default function ClergyCard({ member }: { member: ClergyMember }) {
  return (
    <article className="card flex flex-col items-center gap-3 p-6 text-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-cream">
        {member.photo && <Image src={member.photo} alt="" fill className="object-cover" />}
      </div>
      <h3 className="text-lg">{member.name}</h3>
      <p className="text-base font-semibold text-gold">{member.title}</p>
      <p className="text-base text-ink-muted">{member.parish}</p>
      <p className="text-base text-ink-muted">{member.archdeaconry}</p>
      {member.email && (
        <a href={`mailto:${member.email}`} className="text-base font-semibold text-blue hover:text-gold">
          {member.email}
        </a>
      )}
    </article>
  );
}
