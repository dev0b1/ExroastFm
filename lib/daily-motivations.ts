// Comprehensive daily motivation library
// Multiple options per mood, selected based on user input context

export interface MotivationOption {
  text: string;
  keywords: string[]; // Keywords in user message that match this motivation
  intensity: 'gentle' | 'moderate' | 'strong'; // Emotional intensity
}

export const MOTIVATION_LIBRARY: Record<string, MotivationOption[]> = {
  hurting: [
    {
      text: "Listen… it's okay to hurt. But don't let that pain define you. They couldn't handle your energy, your growth, your realness. You're not broken — you're becoming. Keep choosing yourself. You're literally unstoppable right now.",
      keywords: ['hurt', 'pain', 'sad', 'crying', 'broken', 'heart', 'miss'],
      intensity: 'moderate'
    },
    {
      text: "I know it hurts right now, and that's valid. But remember: you survived 100% of your worst days. This pain is temporary, but your strength? That's permanent. You're going to look back at this moment and realize it was the start of your comeback story.",
      keywords: ['sad', 'depressed', 'lonely', 'empty', 'numb', 'can\'t', 'won\'t'],
      intensity: 'gentle'
    },
    {
      text: "The fact that you're hurting means you loved deeply. That's not a weakness — that's your superpower. They lost someone who could love like that. You lost someone who couldn't. Who really won here? Keep going.",
      keywords: ['love', 'loved', 'cared', 'feelings', 'emotions', 'deep'],
      intensity: 'moderate'
    },
    {
      text: "Your heart is healing, not breaking. Every tear is washing away what wasn't meant for you. You're not losing them — you're finding yourself. And that version of you? Absolutely unstoppable.",
      keywords: ['healing', 'moving on', 'getting better', 'recovery', 'progress'],
      intensity: 'gentle'
    },
    {
      text: "They left you? Good. Now you have space for someone who actually deserves you. Someone who won't make you question your worth. Someone who sees your value. Until then? You're your own best company.",
      keywords: ['left', 'abandoned', 'ghosted', 'walked away', 'gave up'],
      intensity: 'strong'
    },
    {
      text: "The pain you feel today is the strength you'll have tomorrow. Every moment you choose yourself over them is a victory. You're not just surviving — you're thriving. Keep going, warrior.",
      keywords: ['surviving', 'getting through', 'day by day', 'one day', 'time'],
      intensity: 'moderate'
    }
  ],
  confidence: [
    {
      text: "You know what? You're doing better than you think. Every day without them is a day you choose YOU. They're out there questioning everything while you're out here leveling up. Keep that crown on. You earned it.",
      keywords: ['confidence', 'self-esteem', 'worth', 'value', 'better', 'improving'],
      intensity: 'moderate'
    },
    {
      text: "Remember who you were before them? That person is still there, but now they're upgraded. You've learned, grown, and evolved. You're not the same person they left — you're better. Way better.",
      keywords: ['before', 'old me', 'myself', 'who i am', 'identity', 'self'],
      intensity: 'moderate'
    },
    {
      text: "You're the main character of your story, not a supporting role in theirs. Stop waiting for validation from someone who couldn't see your worth. You're valuable, you're enough, and you're absolutely crushing it.",
      keywords: ['worth', 'enough', 'valuable', 'important', 'matter', 'deserve'],
      intensity: 'strong'
    },
    {
      text: "Confidence isn't about thinking you're perfect — it's about knowing you're enough. And you are. You're more than enough. You're a whole person, complete on your own. That's powerful.",
      keywords: ['enough', 'complete', 'whole', 'perfect', 'flaws', 'imperfect'],
      intensity: 'gentle'
    },
    {
      text: "They couldn't handle your light, so they tried to dim it. Joke's on them — you're a supernova. Your glow-up is inevitable. Your confidence? Unshakeable. Your future? Bright as hell.",
      keywords: ['light', 'bright', 'shine', 'glow', 'energy', 'power'],
      intensity: 'strong'
    },
    {
      text: "Every time you choose yourself, you're building unbreakable confidence. Every boundary you set, every standard you keep, every time you say 'I deserve better' — that's confidence in action. Keep going.",
      keywords: ['boundaries', 'standards', 'deserve better', 'respect', 'self-respect'],
      intensity: 'moderate'
    }
  ],
  angry: [
    {
      text: "Channel that anger into power. They thought they could play you? Watch you turn that rage into motivation. Every workout, every win, every glow-up is a reminder: you're the catch they couldn't keep. Now go be unstoppable.",
      keywords: ['angry', 'mad', 'furious', 'rage', 'hate', 'pissed', 'frustrated'],
      intensity: 'strong'
    },
    {
      text: "Your anger is valid. They hurt you, and that matters. But don't let them live rent-free in your head. Use that fire to fuel your comeback. The best revenge? Living your best life without them.",
      keywords: ['valid', 'hurt', 'wrong', 'unfair', 'betrayed', 'lied'],
      intensity: 'moderate'
    },
    {
      text: "They messed with the wrong person. Your anger is your fuel. Turn it into focus. Turn it into determination. Turn it into the energy that propels you forward. They'll regret it, but you won't even notice because you'll be too busy winning.",
      keywords: ['wrong', 'mistake', 'regret', 'revenge', 'payback', 'karma'],
      intensity: 'strong'
    },
    {
      text: "Anger is just love with nowhere to go. Redirect it. Channel it into self-improvement, into goals, into becoming the person they'll wish they never lost. That's how you win.",
      keywords: ['love', 'cared', 'gave', 'tried', 'effort', 'invested'],
      intensity: 'moderate'
    },
    {
      text: "You have every right to be angry. But don't let that anger consume you — let it transform you. Use it as motivation to level up, to glow up, to show up as the best version of yourself. That's the ultimate power move.",
      keywords: ['right', 'deserve', 'should', 'entitled', 'fair', 'justice'],
      intensity: 'moderate'
    },
    {
      text: "That anger? It's your body's way of saying 'I deserve better.' Listen to it. Honor it. Then channel it into becoming the person who never has to settle for less than they deserve again.",
      keywords: ['deserve', 'better', 'settle', 'accept', 'standards', 'worth'],
      intensity: 'strong'
    }
  ],
  unstoppable: [
    {
      text: "THAT'S the energy! You're not just moving on — you're moving UP. They're somewhere crying while you're out here thriving. You didn't lose a partner — you lost a liability. Keep choosing yourself. Elite behavior only.",
      keywords: ['unstoppable', 'thriving', 'winning', 'success', 'great', 'amazing', 'best'],
      intensity: 'strong'
    },
    {
      text: "Look at you. Actually thriving. Not just surviving — THRIVING. They're probably still stuck in the same place, but you? You're leveling up daily. This is your era. Own it completely.",
      keywords: ['thriving', 'winning', 'success', 'great', 'good', 'happy', 'excited'],
      intensity: 'strong'
    },
    {
      text: "You're in your main character era and nothing can stop you. Every day is a new opportunity to show yourself — and the world — exactly who you are. Unstoppable. Unbreakable. Unforgettable.",
      keywords: ['main character', 'era', 'best', 'amazing', 'incredible', 'unstoppable'],
      intensity: 'strong'
    },
    {
      text: "This is what winning looks like. Not because you 'got over' them, but because you chose yourself. Every single day. That's the real victory. Keep that energy. It's magnetic.",
      keywords: ['winning', 'victory', 'success', 'chose', 'choosing', 'myself'],
      intensity: 'moderate'
    },
    {
      text: "You're not just moving forward — you're flying. And the best part? You're doing it solo. No one holding you back. No one dimming your light. Just pure, unadulterated growth. This is your moment.",
      keywords: ['forward', 'progress', 'growth', 'improving', 'better', 'solo', 'alone'],
      intensity: 'moderate'
    },
    {
      text: "Elite behavior. That's what you're showing right now. Not because you're perfect, but because you're choosing growth over comfort. That's how legends are made. Keep going.",
      keywords: ['elite', 'legend', 'icon', 'queen', 'king', 'boss', 'power'],
      intensity: 'strong'
    }
  ]
};

/**
 * Select the best motivation based on user's mood and message
 * Matches keywords in the user's message to find the most relevant motivation
 */
export function selectMotivation(mood: string, userMessage: string): string {
  const moodKey = mood === 'unstoppable' ? 'unstoppable' : mood || 'hurting';
  const options = MOTIVATION_LIBRARY[moodKey] || MOTIVATION_LIBRARY.hurting;
  
  if (options.length === 0) {
    return "You've got this. Keep going.";
  }

  // Normalize user message for keyword matching
  const normalizedMessage = userMessage.toLowerCase();
  
  // Score each option based on keyword matches
  const scoredOptions = options.map(option => {
    let score = 0;
    option.keywords.forEach(keyword => {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    return { ...option, score };
  });

  // Sort by score (highest first), then by intensity
  scoredOptions.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const intensityOrder = { 'strong': 3, 'moderate': 2, 'gentle': 1 };
    return intensityOrder[b.intensity] - intensityOrder[a.intensity];
  });

  // Return the top match, or random if no matches
  const topMatch = scoredOptions[0];
  if (topMatch.score > 0) {
    return topMatch.text;
  }

  // If no keyword matches, return a random option from the mood
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex].text;
}

// Fallback list for external generation failures
export const DAILY_MOTIVATIONS: string[] = [
  "They didn't lose you. You upgraded.",
  "Your ex is a lesson, not a life sentence. Move up, not back.",
  "Glow-up season: you were born ready.",
  "Plot twist: you were always the prize.",
  "Their loss, literally everyone else's gain.",
  "Main character energy only — next chapter loading.",
  "You're not healing, you're leveling up.",
  "They left? Good. More room for your upgrade.",
  "Unbothered. Moisturized. In your lane. Flourishing.",
  "You dodged a bullet. Now dodge their apology text.",
  "From heartbroken to heartbreaker energy — spin that narrative.",
  "You're the plot twist they didn't see coming.",
  "Keep the receipts, but spend the glow-up.",
  "Less drama, more champagne — celebrate the upgrade.",
  "You're busy building an empire; exes are background noise.",
  "Confidence is the best revenge — wear it daily.",
  "They were a practice run; now you headline.",
  "Smile louder. Dance harder. Flourish further.",
  "You are the vibe, not the victim.",
  "New day, new you — make it iconic."
];

export function getFallbackMotivation(dayNumber: number = 1): string {
  const index = ((dayNumber - 1) % DAILY_MOTIVATIONS.length + DAILY_MOTIVATIONS.length) % DAILY_MOTIVATIONS.length;
  return DAILY_MOTIVATIONS[index];
}
