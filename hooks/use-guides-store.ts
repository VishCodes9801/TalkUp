import createContextHook from "@nkzw/create-context-hook";
import { useState } from "react";

import { Guide } from "@/types/speech";
import { mockGuides } from "@/mocks/guides";

export const [GuidesContext, useGuides] = createContextHook(() => {
  const [guides, setGuides] = useState<Guide[]>(mockGuides);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const getGuideById = (id: string): Guide | undefined => {
    return guides.find(guide => guide.id === id);
  };

  const getGuidesByDifficulty = (difficulty: "beginner" | "intermediate" | "advanced"): Guide[] => {
    return guides.filter(guide => guide.difficulty === difficulty);
  };

  return {
    guides,
    selectedGuide,
    setSelectedGuide,
    getGuideById,
    getGuidesByDifficulty,
  };
});
