import { prisma } from '@/lib/prisma/index';
import { User, Team, TeamMembershipRole } from '@prisma/client';

export async function createTestUser(
  email: string = 'test@example.com'
): Promise<User> {
  return await prisma.user.create({
    data: {
      email,
    },
  });
}

export async function createTestTeam(
  name: string = 'Test Team'
): Promise<Team> {
  return await prisma.team.create({
    data: {
      name,
    },
  });
}

export async function createTestTeamMembership(userId: string, teamId: string) {
  return await prisma.teamMembership.create({
    data: {
      userId,
      teamId,
      role: TeamMembershipRole.OWNER,
    },
  });
}

export async function cleanupTestData(): Promise<void> {
  // Clean up in reverse order of dependencies
  await prisma.teamMembership.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});
}
