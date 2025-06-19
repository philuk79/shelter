import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  volunteers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    joinDate: v.number(),
    totalScore: v.number(),
    completedLessons: v.array(v.string()),
    badges: v.array(v.string()),
  }).index("by_user", ["userId"]),

  lessons: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    difficulty: v.string(), // "beginner", "intermediate", "advanced"
    category: v.string(),
    content: v.string(),
    points: v.number(),
    order: v.number(),
    isActive: v.boolean(),
  }).index("by_order", ["order"]),

  progress: defineTable({
    volunteerId: v.id("volunteers"),
    lessonId: v.string(),
    completed: v.boolean(),
    score: v.number(),
    completedAt: v.number(),
    timeSpent: v.number(), // in seconds
  }).index("by_volunteer", ["volunteerId"])
    .index("by_lesson", ["lessonId"]),

  quizResults: defineTable({
    volunteerId: v.id("volunteers"),
    lessonId: v.string(),
    answers: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
      correct: v.boolean(),
    })),
    score: v.number(),
    completedAt: v.number(),
  }).index("by_volunteer", ["volunteerId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
