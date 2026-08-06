import { DashboardBoard } from "@/components/kanban/DashboardBoard";
import type { DrawerLead } from "@/components/kanban/LeadDrawer";
import { formatDateTime, formatRelative } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { leadRepository } from "@/repositories/lead.repository";

export default async function DashboardPage() {
  const leads = await leadRepository.listAllWithDetails(prisma);

  const drawerLeads: DrawerLead[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    status: lead.status,
    cardName: lead.card.name,
    djName: lead.card.dj.name,
    cardPrice: Number(lead.card.price),
    updatedLabel: formatRelative(lead.updatedAt),
    rarity: lead.card.rarity.toLowerCase() as DrawerLead["rarity"],
    representativeName: lead.representative.name,
    createdAtLabel: formatDateTime(lead.createdAt),
  }));

  return <DashboardBoard leads={drawerLeads} />;
}
