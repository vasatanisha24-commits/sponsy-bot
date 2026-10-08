import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a user (you)
  const user = await prisma.user.upsert({
    where: { email: 'vasa.tanisha24@gmail.com' },
    update: {},
    create: {
      name: 'Tanisha Vasa',
      email: 'vasa.tanisha24@gmail.com',
      role: 'operator',
    },
  });

  // Create a sample sponsor
  const sponsor = await prisma.sponsor.create({
    data: {
      companyName: 'Vercel',
      website: 'https://vercel.com',
      industry: 'Developer Tools',
      description: 'Frontend cloud platform for deploying web apps',
      tier: 'gold',
      priority: 'high',
      status: 'researched',
      assignedTo: user.id,
    },
  });

  // Create a contact for that sponsor
  await prisma.contact.create({
    data: {
      sponsorId: sponsor.id,
      name: 'Jane Doe',
      email: 'jane@vercel.com',
      role: 'Partnerships',
    },
  });

  console.log('✅ Database seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());