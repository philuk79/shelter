import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { LessonView } from "./components/LessonView";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "lesson">("dashboard");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handleStartLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentView("lesson");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedLessonId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-orange-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shelter Maps Training</h1>
              <p className="text-sm text-gray-600">Manchester Community Hub</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {currentView === "dashboard" ? (
          <Dashboard onStartLesson={handleStartLesson} />
        ) : (
          <LessonView 
            lessonId={selectedLessonId!} 
            onBack={handleBackToDashboard}
          />
        )}
      </main>
      <Toaster />
    </div>
  );
}
