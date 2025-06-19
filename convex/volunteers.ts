import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentVolunteer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const volunteer = await ctx.db
      .query("volunteers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return volunteer;
  },
});

export const createVolunteer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingVolunteer = await ctx.db
      .query("volunteers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingVolunteer) {
      return existingVolunteer._id;
    }

    return await ctx.db.insert("volunteers", {
      userId,
      name: args.name,
      email: args.email,
      joinDate: Date.now(),
      totalScore: 0,
      completedLessons: [],
      badges: [],
    });
  },
});

export const updateProgress = mutation({
  args: {
    lessonId: v.string(),
    score: v.number(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const volunteer = await ctx.db
      .query("volunteers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!volunteer) throw new Error("Volunteer not found");

    // Record progress
    await ctx.db.insert("progress", {
      volunteerId: volunteer._id,
      lessonId: args.lessonId,
      completed: true,
      score: args.score,
      completedAt: Date.now(),
      timeSpent: args.timeSpent,
    });

    // Update volunteer's total score and completed lessons
    const newCompletedLessons = volunteer.completedLessons.includes(args.lessonId)
      ? volunteer.completedLessons
      : [...volunteer.completedLessons, args.lessonId];

    await ctx.db.patch(volunteer._id, {
      totalScore: volunteer.totalScore + args.score,
      completedLessons: newCompletedLessons,
    });

    // Award badges based on progress
    const badges = [...volunteer.badges];
    if (newCompletedLessons.length >= 3 && !badges.includes("Getting Started")) {
      badges.push("Getting Started");
    }
    if (newCompletedLessons.length >= 6 && !badges.includes("Maps Explorer")) {
      badges.push("Maps Explorer");
    }
    if (newCompletedLessons.length >= 10 && !badges.includes("Navigation Expert")) {
      badges.push("Navigation Expert");
    }

    if (badges.length > volunteer.badges.length) {
      await ctx.db.patch(volunteer._id, { badges });
    }

    return { success: true, newBadges: badges.filter(b => !volunteer.badges.includes(b)) };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const volunteers = await ctx.db
      .query("volunteers")
      .order("desc")
      .take(10);

    return volunteers
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((v, index) => ({
        rank: index + 1,
        name: v.name,
        totalScore: v.totalScore,
        completedLessons: v.completedLessons.length,
        badges: v.badges.length,
      }));
  },
});
