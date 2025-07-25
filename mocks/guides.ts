import { Guide } from "@/types/speech";

export const mockGuides: Guide[] = [
  {
    id: "1",
    title: "Elevator Pitch",
    description: "Practice delivering a concise 30-second introduction about yourself or your business.",
    duration: "2 minutes",
    difficulty: "beginner",
    prompt: "Imagine you're in an elevator with someone important in your industry. You have 30 seconds to introduce yourself and make an impression. What would you say?",
  },
  {
    id: "2",
    title: "Storytelling Basics",
    description: "Learn to structure and deliver a compelling personal story.",
    duration: "5 minutes",
    difficulty: "beginner",
    prompt: "Tell a story about a challenge you faced and overcame. Include a beginning, middle, and end with a lesson learned.",
  },
  {
    id: "3",
    title: "Persuasive Argument",
    description: "Practice making a convincing case for something you believe in.",
    duration: "3 minutes",
    difficulty: "intermediate",
    prompt: "Choose a topic you care about and make a persuasive argument. Include at least three supporting points and address one potential counterargument.",
  },
  {
    id: "4",
    title: "Technical Explanation",
    description: "Practice explaining a complex concept in simple terms.",
    duration: "4 minutes",
    difficulty: "intermediate",
    prompt: "Explain a technical concept from your field to someone with no background knowledge. Use analogies and simple language.",
  },
  {
    id: "5",
    title: "Impromptu Speech",
    description: "Practice thinking on your feet with a random topic.",
    duration: "2 minutes",
    difficulty: "advanced",
    prompt: "Give a 2-minute speech on one of these random topics: 'The future of transportation', 'The importance of hobbies', or 'How technology has changed communication'.",
  },
  {
    id: "6",
    title: "Handling Q&A",
    description: "Practice responding to unexpected questions clearly and confidently.",
    duration: "5 minutes",
    difficulty: "advanced",
    prompt: "Imagine you've just given a presentation on your area of expertise. Prepare answers to 3-5 potential questions, including one challenging question.",
  },
];
