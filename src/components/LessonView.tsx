import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface LessonViewProps {
  lessonId: string;
  onBack: () => void;
}

export function LessonView({ lessonId, onBack }: LessonViewProps) {
  const lesson = useQuery(api.lessons.getLessonById, { lessonId });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  const lessonContent = lesson ? JSON.parse(lesson.content) : null;
  const steps = lessonContent?.steps || [];

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    
    setIsCompleting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Dispatch custom event to update progress
      const event = new CustomEvent('updateProgress', {
        detail: {
          lessonId: lesson.id,
          points: lesson.points,
          timeSpent
        }
      });
      window.dispatchEvent(event);

      toast.success("Lesson completed successfully!");
      onBack();
    } catch (error) {
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!lesson || !lessonContent) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        <p className="text-gray-600">{lesson.description}</p>
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {currentStepData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentStepData.title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {currentStepData.content}
              </p>
            </div>

            {/* Interactive Elements */}
            <div className="bg-gray-50 rounded-lg p-6">
              {currentStepData.action === "search" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Try this search:</h3>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm">
                    {currentStepData.target}
                  </div>
                  <p className="text-sm text-gray-600">
                    Open Google Maps and search for this location. Notice how it appears on the map and what information is provided.
                  </p>
                  <button 
                    onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(currentStepData.target)}`, '_blank')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Open in Google Maps
                  </button>
                </div>
              )}

              {currentStepData.action === "directions" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Get directions:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
                      <div className="bg-white border border-gray-300 rounded-lg p-3 text-sm">
                        {currentStepData.from}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                      <div className="bg-white border border-gray-300 rounded-lg p-3 text-sm">
                        {currentStepData.to}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Try different transport options: walking, public transport, and driving. Compare the times and routes.
                  </p>
                  <button 
                    onClick={() => window.open(`https://maps.google.com/maps/dir/${encodeURIComponent(currentStepData.from)}/${encodeURIComponent(currentStepData.to)}`, '_blank')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              )}

              {currentStepData.action === "search_nearby" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Search for nearby services:</h3>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm">
                    {currentStepData.query}
                  </div>
                  <p className="text-sm text-gray-600">
                    Look at the results and check which ones are currently open. Note their ratings and reviews.
                  </p>
                  <button 
                    onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(currentStepData.query)}`, '_blank')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Search on Maps
                  </button>
                </div>
              )}

              {currentStepData.action === "street_view" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Use Street View:</h3>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 text-sm">
                    {currentStepData.location}
                  </div>
                  <p className="text-sm text-gray-600">
                    Click and drag the Street View person (Pegman) onto the map to see the street-level view. This helps identify building entrances and landmarks.
                  </p>
                  <button 
                    onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(currentStepData.location)}&layer=c&cbll=53.4808,-2.2426`, '_blank')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View in Street View
                  </button>
                </div>
              )}

              {currentStepData.action === "introduction" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to become a Maps expert?
                  </h3>
                  <p className="text-gray-600">
                    These skills will help you assist clients more effectively and navigate Manchester with confidence.
                  </p>
                </div>
              )}

              {(currentStepData.action === "accessible_directions" || currentStepData.action === "emergency_search" || currentStepData.action === "compare_routes" || currentStepData.action === "check_details" || currentStepData.action === "check_accessibility" || currentStepData.action === "share_location" || currentStepData.action === "offline_maps" || currentStepData.action === "explore_interface") && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Practice this skill:</h3>
                  <p className="text-sm text-gray-600">
                    Follow the instructions above and practice using Google Maps for this scenario.
                  </p>
                  <button 
                    onClick={() => window.open('https://maps.google.com', '_blank')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Open Google Maps
                  </button>
                </div>
              )}
            </div>

            {/* Manchester-specific tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Manchester Tip:</h4>
              <p className="text-blue-800 text-sm">
                {lesson.id === "basics-1" && "Manchester's city center can be confusing with its mix of old and new streets. Always double-check the postcode!"}
                {lesson.id === "navigation-1" && "Manchester's tram system (Metrolink) is often faster than buses for longer distances across the city."}
                {lesson.id === "services-1" && "Many services in Manchester city center are within walking distance of each other - sometimes walking is quicker than transport."}
                {lesson.id === "accessibility-1" && "Manchester city center has many pedestrianized areas and most modern buildings have good accessibility features."}
                {lesson.id === "emergency-1" && "Manchester Royal Infirmary is the main A&E for the city center, but there are several urgent care centers for non-emergency situations."}
                {lesson.id === "advanced-1" && "Download offline maps of Manchester city center and surrounding areas - mobile signal can be patchy in some buildings."}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous Step
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleCompleteLesson}
              disabled={isCompleting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCompleting ? "Completing..." : `Complete Lesson (+${lesson.points} points)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
