import { prisma } from '@/lib/prisma';
import { Team, User, TeamMembershipRole } from '@prisma/client';

function getTeamName(email: string): string {
  const [name] = email.split('@');
  return name.charAt(0).toUpperCase() + name.slice(1) + "'s Team";
}

export async function findOrCreateDefaultTeam(userId: string): Promise<Team> {
  try {
    // Find user
    const user: User | null = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Throw an error if user not found
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check if user already belongs to a team
    const existingTeamMembership = await prisma.teamMembership.findFirst({
      where: { userId },
      include: { team: true },
    });

    // If user already belongs to a team, return the team
    if (existingTeamMembership) return existingTeamMembership.team;

    // Create default team otherwise
    return prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name: getTeamName(user.email),
          teamMemberships: {
            create: {
              userId,
              role: TeamMembershipRole.OWNER,
            },
          },
        },
      });

      return newTeam;
    });
  } catch (error) {
    console.error('Error creating default team:', error);
    throw error;
  }
}
