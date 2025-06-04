import { findOrCreateDefaultTeam } from '../find-or-create-default-team';
import {
  createTestUser,
  createTestTeam,
  createTestTeamMembership,
} from '@/test/test-helpers';
import { prisma } from '@/lib/prisma/index';
import { TeamMembershipRole } from '@prisma/client';

describe('findOrCreateDefaultTeam', () => {
  describe('when user does not exist', () => {
    it('should throw an error', async () => {
      const nonExistentUserId = 'non-existent-user-id';

      await expect(findOrCreateDefaultTeam(nonExistentUserId)).rejects.toThrow(
        `User with ID ${nonExistentUserId} not found`
      );
    });
  });

  describe('when user exists but has no team', () => {
    it('should create a new team with the user as owner', async () => {
      const testEmail = 'john.doe@example.com';
      const user = await createTestUser({ email: testEmail });

      const result = await findOrCreateDefaultTeam(user.id);

      expect(result).toBeDefined();
      expect(result.name).toBe("John.doe's Team");

      // Verify team membership was created
      const teamMembership = await prisma.teamMembership.findFirst({
        where: {
          userId: user.id,
          teamId: result.id,
        },
      });

      expect(teamMembership).toBeDefined();
      expect(teamMembership?.role).toBe(TeamMembershipRole.OWNER);
    });

    it('should create team name correctly from email with uppercase first letter', async () => {
      const testEmail = 'alice.smith@company.com';
      const user = await createTestUser({ email: testEmail });

      const result = await findOrCreateDefaultTeam(user.id);

      expect(result.name).toBe("Alice.smith's Team");
    });

    it('should handle email with single character username', async () => {
      const testEmail = 'a@example.com';
      const user = await createTestUser({ email: testEmail });

      const result = await findOrCreateDefaultTeam(user.id);

      expect(result.name).toBe("A's Team");
    });

    it('should handle email with complex username', async () => {
      const testEmail = 'test-user_123@example.com';
      const user = await createTestUser({ email: testEmail });

      const result = await findOrCreateDefaultTeam(user.id);

      expect(result.name).toBe("Test-user_123's Team");
    });
  });

  describe('when user exists and already has a team', () => {
    it('should return the existing team', async () => {
      const user = await createTestUser({ email: 'existing@example.com' });
      const existingTeam = await createTestTeam({ name: 'Existing Team' });
      await createTestTeamMembership({
        userId: user.id,
        teamId: existingTeam.id,
      });

      const result = await findOrCreateDefaultTeam(user.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(existingTeam.id);
      expect(result.name).toBe('Existing Team');

      // Verify no additional team was created
      const totalTeams = await prisma.team.count();
      expect(totalTeams).toBe(1);
    });

    it('should return the first team if user belongs to multiple teams', async () => {
      const user = await createTestUser({ email: 'multiuser@example.com' });
      const firstTeam = await createTestTeam({ name: 'First Team' });
      const secondTeam = await createTestTeam({ name: 'Second Team' });

      await createTestTeamMembership({ userId: user.id, teamId: firstTeam.id });
      await createTestTeamMembership({
        userId: user.id,
        teamId: secondTeam.id,
      });

      const result = await findOrCreateDefaultTeam(user.id);

      expect(result).toBeDefined();
      expect([firstTeam.id, secondTeam.id]).toContain(result.id);

      // Verify no additional team was created
      const totalTeams = await prisma.team.count();
      expect(totalTeams).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error at the user lookup stage
      const originalFindUnique = prisma.user.findUnique;
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      prisma.user.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(findOrCreateDefaultTeam('any-user-id')).rejects.toThrow(
        'Database connection failed'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating default team:',
        expect.any(Error)
      );

      // Cleanup
      prisma.user.findUnique = originalFindUnique;
      consoleSpy.mockRestore();
    });

    it('should handle invalid user ID format', async () => {
      const invalidUserId = '';

      await expect(findOrCreateDefaultTeam(invalidUserId)).rejects.toThrow();
    });
  });
});
