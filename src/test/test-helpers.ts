import { prisma } from '@/lib/prisma/index';
import { User, Team, TeamMembership, TeamMembershipRole } from '@prisma/client';

export async function createTestUser(
  params: { email?: string } = {}
): Promise<User> {
  const { email = 'test@example.com' } = params;
  return await prisma.user.create({
    data: {
      email,
    },
  });
}

export async function createTestTeam(
  params: { name?: string } = {}
): Promise<Team> {
  const { name = 'Test Team' } = params;
  return await prisma.team.create({
    data: {
      name,
    },
  });
}

export async function createTestTeamMembership(params: {
  userId: string;
  teamId: string;
  role?: TeamMembershipRole;
}): Promise<TeamMembership> {
  const { userId, teamId, role = TeamMembershipRole.OWNER } = params;
  return await prisma.teamMembership.create({
    data: {
      userId,
      teamId,
      role,
    },
  });
}
