"use server";

import {
  personalizedPropertyRecommendations,
  type PersonalizedPropertyRecommendationsInput,
  type PersonalizedPropertyRecommendationsOutput,
} from "@/ai/flows/personalized-property-recommendations";

export async function getRecommendations(
  input: PersonalizedPropertyRecommendationsInput
): Promise<PersonalizedPropertyRecommendationsOutput> {
  // Here you could add more server-side logic, like fetching
  // a more detailed browsing history from a database if the user is logged in.

  try {
    const recommendations = await personalizedPropertyRecommendations(input);
    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw new Error("Failed to generate property recommendations.");
  }
}
