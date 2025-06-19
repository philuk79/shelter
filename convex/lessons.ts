import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllLessons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_order")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getLessonById = query({
  args: { lessonId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("id"), args.lessonId))
      .unique();
  },
});

export const initializeLessons = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if lessons already exist
    const existingLessons = await ctx.db.query("lessons").take(1);
    if (existingLessons.length > 0) return;

    const lessons = [
      {
        id: "basics-1",
        title: "Getting Started with Google Maps",
        description: "Learn the basics of navigating Google Maps and finding locations in Manchester",
        difficulty: "beginner",
        category: "basics",
        content: JSON.stringify({
          type: "interactive",
          steps: [
            {
              title: "Welcome to Google Maps Training",
              content: "As a Shelter volunteer, you'll use Google Maps to help people find essential services, navigate to appointments, and locate our community hubs. Let's start with the basics!",
              action: "introduction"
            },
            {
              title: "Finding Our Community Hub",
              content: "Let's start by finding our main hub: Shelter Community Hub, Swan Buildings, 20 Swan Street, Manchester M4 5JW",
              action: "search",
              target: "Shelter Community Hub Manchester"
            },
            {
              title: "Understanding the Interface",
              content: "Notice the search bar, map controls, and different view options. The satellite view can be helpful for identifying buildings.",
              action: "explore_interface"
            }
          ]
        }),
        points: 100,
        order: 1,
        isActive: true,
      },
      {
        id: "navigation-1",
        title: "Getting Directions in Manchester",
        description: "Learn how to get walking, driving, and public transport directions around Manchester",
        difficulty: "beginner",
        category: "navigation",
        content: JSON.stringify({
          type: "interactive",
          steps: [
            {
              title: "Getting Directions",
              content: "Help someone get from Manchester Piccadilly Station to our Community Hub using public transport.",
              action: "directions",
              from: "Manchester Piccadilly Station",
              to: "Swan Buildings, 20 Swan Street, Manchester M4 5JW"
            },
            {
              title: "Alternative Routes",
              content: "Always check alternative routes - sometimes walking might be faster than waiting for a bus!",
              action: "compare_routes"
            }
          ]
        }),
        points: 150,
        order: 2,
        isActive: true,
      },
      {
        id: "services-1",
        title: "Finding Essential Services",
        description: "Locate food banks, medical centers, and other essential services around Manchester",
        difficulty: "intermediate",
        category: "services",
        content: JSON.stringify({
          type: "interactive",
          steps: [
            {
              title: "Finding Food Banks",
              content: "A client needs to find the nearest food bank to Manchester City Centre. Let's help them locate one.",
              action: "search_nearby",
              query: "food bank Manchester city centre"
            },
            {
              title: "Medical Services",
              content: "Now find the nearest NHS walk-in centre to our Community Hub.",
              action: "search_nearby",
              query: "NHS walk in centre Manchester M4"
            },
            {
              title: "Checking Opening Hours",
              content: "Always check opening hours and contact details before directing someone to a service.",
              action: "check_details"
            }
          ]
        }),
        points: 200,
        order: 3,
        isActive: true,
      },
      {
        id: "accessibility-1",
        title: "Accessibility Features",
        description: "Learn how to find wheelchair accessible routes and locations",
        difficulty: "intermediate",
        category: "accessibility",
        content: JSON.stringify({
          type: "interactive",
          steps: [
            {
              title: "Wheelchair Accessible Routes",
              content: "Help someone in a wheelchair get from our Community Hub to Manchester Central Library.",
              action: "accessible_directions",
              from: "Swan Buildings, 20 Swan Street, Manchester M4 5JW",
              to: "Manchester Central Library"
            },
            {
              title: "Checking Accessibility",
              content: "Look for accessibility information in location details - ramps, lifts, accessible toilets.",
              action: "check_accessibility"
            }
          ]
        }),
        points: 200,
        order: 4,
        isActive: true,
      },
      {
        id: "emergency-1",
        title: "Emergency Situations",
        description: "Quick location finding for urgent situations",
        difficulty: "advanced",
        category: "emergency",
        content: JSON.stringify({
          type: "interactive",
          steps: [
            {
              title: "Nearest Hospital",
              content: "Someone needs urgent medical attention near Piccadilly Gardens. Find the nearest A&E department.",
              action: "emergency_search",
              query: "A&E hospital Piccadilly Gardens Manchester"
            },
            {
              title: "Police Station",
              content: "Find the nearest police station to report an incident near the Northern Quarter.",
              action: "emergency_search",
              query: "police station Northern Quarter Manchester"
            }
          ]
        }),
        points: 250,
        order: 5,
        isActive: true,
      },
      {
        id: "advanced-1",
        title: "Advanced Features",
        description: "Street View, offline maps, and sharing locations",
        difficulty: "advanced",
        category: "advanced",
        content: JSON.stringify({
          type: "interactive",
          steps: [
            {
              title: "Using Street View",
              content: "Use Street View to help someone identify the entrance to our Community Hub on Cable Street.",
              action: "street_view",
              location: "Swan Buildings, 20 Swan Street, Manchester M4 5JW"
            },
            {
              title: "Sharing Locations",
              content: "Learn how to share location links via text or WhatsApp for clients without smartphones.",
              action: "share_location"
            },
            {
              title: "Offline Maps",
              content: "Download offline maps of Manchester for areas with poor signal.",
              action: "offline_maps"
            }
          ]
        }),
        points: 300,
        order: 6,
        isActive: true,
      }
    ];

    for (const lesson of lessons) {
      await ctx.db.insert("lessons", lesson);
    }

    return { success: true, count: lessons.length };
  },
});
