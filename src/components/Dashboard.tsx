import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DashboardProps {
  onStartLesson: (lessonId: string) => void;
}

// Simple local storage for progress tracking
const getLocalProgress = () => {
  const stored = localStorage.getItem('shelter-training-progress');
  return stored ? JSON.parse(stored) : {
    completedLessons: [],
    totalScore: 0,
    badges: []
  };
};

const saveLocalProgress = (progress: any) => {
  localStorage.setItem('shelter-training-progress', JSON.stringify(progress));
};

export function Dashboard({ onStartLesson }: DashboardProps) {
  const lessons = useQuery(api.lessons.getAllLessons);
  const initializeLessons = useMutation(api.lessons.initializeLessons);
  
  const [progress, setProgress] = useState(getLocalProgress());
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!lessons && !isInitializing) {
        setIsInitializing(true);
        try {
          await initializeLessons({});
          toast.success("Welcome to Shelter Maps Training!");
        } catch (error) {
          console.error("Initialization error:", error);
          toast.error("Failed to initialize. Please refresh the page.");
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initialize();
  }, [lessons, initializeLessons, isInitializing]);

  // Function to update progress
  const updateProgress = (lessonId: string, points: number) => {
    const newProgress = { ...progress };
    
    if (!newProgress.completedLessons.includes(lessonId)) {
      newProgress.completedLessons.push(lessonId);
      newProgress.totalScore += points;
      
      // Award badges
      if (newProgress.completedLessons.length >= 3 && !newProgress.badges.includes("Getting Started")) {
        newProgress.badges.push("Getting Started");
        toast.success("Badge earned: Getting Started! 🏆");
      }
      if (newProgress.completedLessons.length >= 6 && !newProgress.badges.includes("Maps Explorer")) {
        newProgress.badges.push("Maps Explorer");
        toast.success("Badge earned: Maps Explorer! 🏆");
      }
      if (newProgress.completedLessons.length >= 10 && !newProgress.badges.includes("Navigation Expert")) {
        newProgress.badges.push("Navigation Expert");
        toast.success("Badge earned: Navigation Expert! 🏆");
      }
    }
    
    setProgress(newProgress);
    saveLocalProgress(newProgress);
  };

  // Pass updateProgress to child components via a custom event
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      updateProgress(event.detail.lessonId, event.detail.points);
    };

    window.addEventListener('updateProgress', handleProgressUpdate as EventListener);
    return () => window.removeEventListener('updateProgress', handleProgressUpdate as EventListener);
  }, [progress]);

  if (!lessons) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your training dashboard...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "basics": return "🗺️";
      case "navigation": return "🧭";
      case "services": return "🏥";
      case "accessibility": return "♿";
      case "emergency": return "🚨";
      case "advanced": return "⚡";
      default: return "📍";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Shelter Maps Training! 👋
            </h2>
            <p className="text-gray-600">
              Learn Google Maps skills to better serve our Manchester community
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-red-600">{progress.totalScore}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.completedLessons.length}</div>
                <div className="text-sm text-gray-500">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.badges.length}</div>
                <div className="text-sm text-gray-500">Badges Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((progress.completedLessons.length / lessons.length) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Course Progress</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {progress.badges.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h3>
              <div className="flex flex-wrap gap-3">
                {progress.badges.map((badge: string) => (
                  <div
                    key={badge}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    🏆 {badge}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Lessons</h3>
            <div className="space-y-4">
              {lessons.map((lesson) => {
                const isCompleted = progress.completedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                      isCompleted ? "bg-green-50 border-green-200" : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getCategoryIcon(lesson.category)}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {lesson.title}
                            {isCompleted && <span className="text-green-600">✓</span>}
                          </h4>
                          <p className="text-gray-600 text-sm">{lesson.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                              {lesson.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">{lesson.points} points</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onStartLesson(lesson.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isCompleted
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {isCompleted ? "Review" : "Start"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Hub Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Hub</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Shelter Community Hub</strong></p>
              <p>Swan Buildings<br />20 Swan Street<br />Manchester M4 5JW</p>
              <p className="text-gray-600">(entrance on Cable Street)</p>
              <button 
                onClick={() => window.open('https://maps.google.com/maps?q=Swan+Buildings,+20+Swan+Street,+Manchester+M4+5JW', '_blank')}
                className="mt-3 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                View on Maps
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Always check opening hours before directing clients</li>
              <li>• Use Street View to help identify building entrances</li>
              <li>• Consider accessibility needs when giving directions</li>
              <li>• Save offline maps for areas with poor signal</li>
            </ul>
          </div>

          {/* Training Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Lessons Available:</span>
                <span className="font-medium">{lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Progress:</span>
                <span className="font-medium">{progress.completedLessons.length}/{lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Points:</span>
                <span className="font-medium text-red-600">{progress.totalScore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
