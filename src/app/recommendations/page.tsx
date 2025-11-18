import RecommendationForm from "./recommendation-form";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">AI Property Finder</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Let our intelligent assistant find your dream home. Tell us what you're looking for, and we'll provide personalized recommendations.
        </p>
      </div>
      
      <RecommendationForm />
    </div>
  );
}
