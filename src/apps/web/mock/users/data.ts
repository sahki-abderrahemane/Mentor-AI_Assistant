import { faker, id, isoDate } from "../seed";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "invited" | "suspended";
  emailVerified: boolean;
  bio?: string;
  twoFactorEnabled: boolean;
  lastActiveAt?: string;
  joinedAt: string;
}

export const mockUsers: MockUser[] = Array.from({ length: 6 }).map((_, i) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  return {
    id: i === 0 ? "usr_current" : id("usr"),
    name,
    email: i === 0 ? "you@mentorai.dev" : faker.internet.email({ firstName, lastName }).toLowerCase(),
    avatarUrl: faker.image.avatarGitHub(),
    role: i === 0 ? "admin" : (i < 2 ? "admin" : "member"),
    status: i === 0 ? "active" : "active",
    emailVerified: true,
    bio: faker.lorem.sentence({ min: 6, max: 14 }),
    twoFactorEnabled: i === 0,
    lastActiveAt: isoDate(0),
    joinedAt: isoDate(60 + i * 30),
  };
});

export function getMockUserById(uid: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === uid);
}
