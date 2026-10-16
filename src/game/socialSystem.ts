import { FemaleCharacterData, GesturePosition, WeatherType } from './types';
import { sound, speakEnglishLine } from './audio';

export const INITIAL_FEMALE_CHARACTERS: FemaleCharacterData[] = [
  {
    id: 'elena',
    name: 'Elena Vance',
    title: 'Street Racer & Tuner',
    avatarColor: '#ef4444',
    personality: 'Fiery, daring, adrenaline junkie',
    clothingStyle: 'Crimson racer crop top, tactical shorts, combat boots',
    hairColor: 0x854d0e, // Auburn
    outfitColor: 0xd90429, // Crimson
    accentColor: 0xf59e0b,
    position: [0, 0, 15],
    rotationY: Math.PI,
    affection: 25,
    tier: 'Acquaintance',
    dialogueState: 0,
    status: 'idle',
    quotes: {
      greeting: [
        "Hey Leo! Look at that ride. Are we burning rubber today or what?",
        "There's my favorite driver. Ready to push some RPMs?",
        "Hey handsome! You look like someone who knows how to handle speed.",
      ],
      hugResponse: [
        "Mmm, you're warmer than a twin-turbo engine block, Leo.",
        "That felt amazing. Don't let go just yet.",
      ],
      gentleKissResponse: [
        "Smooth moves, Leo. My pulse is already redlining.",
        "Sweet... but you know I like full throttle, right?",
      ],
      longKissResponse: [
        "Oh wow, Leo... that was breathless. My heart is completely racing!",
        "Ten seconds felt like a heartbeat with you. You've earned the keys to my garage and my heart.",
      ],
      slapResponse: [
        "Ouch! Hey, watch the hands, handsome! I kick back harder!",
        "Feisty today, are we? Don't make me pull my wrench on you, Leo!",
      ],
      kickResponse: [
        "Whoa! What was that for?! Save the martial arts for the underground fight club!",
      ],
      danceResponse: [
        "Look at you, Leo—street king with ballroom finesse. I love this.",
      ],
      passengerComment: [
        "Floor it, Leo! Let's see what this machine can really do!",
        "Nice drift! That was pure precision!",
      ],
      weatherComment: {
        sunny: "Asphalt is hot and dry, perfect traction for top speed!",
        sunset: "Sunset on Ocean Boulevard... perfect time for a scenic cruise with you.",
        storm: "Wet asphalt means crazy drifts! Just watch out for hydroplaning, Leo!",
        fog: "Spooky mist. Feels like we own the whole city tonight.",
        midnight: "Under the neon lights, nobody can catch us.",
      },
    },
  },
  {
    id: 'scarlett',
    name: 'Scarlett Fox',
    title: 'Penthouse Socialite & Broker',
    avatarColor: '#8b5cf6',
    personality: 'Sophisticated, alluring, romantic',
    clothingStyle: 'Midnight navy evening dress, diamond choker, stilettos',
    hairColor: 0x1c1917, // Jet black
    outfitColor: 0x1e1b4b, // Midnight navy
    accentColor: 0xf59e0b,
    position: [-25, 0, -25],
    rotationY: Math.PI / 4,
    affection: 30,
    tier: 'Acquaintance',
    dialogueState: 0,
    status: 'idle',
    quotes: {
      greeting: [
        "Leo, darling. You always arrive right on time.",
        "A gentleman in a city of rogues. Come closer, Leo.",
        "You carry yourself with power, Leo. I find that irresistible.",
      ],
      hugResponse: [
        "Such strength in your arms, darling. It makes me feel safe.",
        "Hold me close. The city can wait for tonight.",
      ],
      gentleKissResponse: [
        "A tantalizing kiss, Leo. You always leave me wanting more.",
        "Delightful, darling. Your lips taste like champagne.",
      ],
      longKissResponse: [
        "Leo... that was pure intoxicating passion. My penthouse doors are forever open to you.",
        "Ten seconds of absolute bliss. You have captured my devotion completely, darling.",
      ],
      slapResponse: [
        "Excuse me?! A gentleman never raises a hand to Scarlett Fox!",
        "Playful or bold, Leo, but do remember who owns this city.",
      ],
      kickResponse: [
        "Heavens, Leo! What unrefined behavior! Apologize right now, darling!",
      ],
      danceResponse: [
        "A waltz beneath the stars... you truly know how to enchant a lady, Leo.",
      ],
      passengerComment: [
        "Drive fast, darling. Let the wind ruin my hair, I don't mind.",
        "Superb driving, Leo. A true connoisseur of speed.",
      ],
      weatherComment: {
        sunny: "A radiant day to view the marina from the terrace.",
        sunset: "The golden hour matches my champagne, darling.",
        storm: "Thunder and rain outside... so cozy if we're together indoors.",
        fog: "The city lights look like glowing jewels in the mist.",
        midnight: "Midnight is when the real game begins, Leo.",
      },
    },
  },
  {
    id: 'maya',
    name: 'Maya Cruz',
    title: 'Underground DJ & Dancer',
    avatarColor: '#ec4899',
    personality: 'Playful, electric, expressive',
    clothingStyle: 'Cyber magenta oversized hoodie, glow headphones, kicks',
    hairColor: 0xd946ef, // Cyber magenta
    outfitColor: 0xa855f7, // Purple
    accentColor: 0x06b6d4,
    position: [25, 0, -25],
    rotationY: -Math.PI / 3,
    affection: 35,
    tier: 'Crush',
    dialogueState: 0,
    status: 'idle',
    quotes: {
      greeting: [
        "Yo Leo! Turn up the bass! Ready to drop the beat with me?",
        "Leo in the building! You brought the good vibes, right?",
        "Hey cutie! Let's shake things up today!",
      ],
      hugResponse: [
        "Aww, best bear hug ever! My heart's hitting 140 BPM!",
        "Super cozy hug! You're the best, Leo!",
      ],
      gentleKissResponse: [
        "Ooh! That was a spark of pure electricity!",
        "Cute! You're making me blush under these glow headphones!",
      ],
      longKissResponse: [
        "Whoooo! That kiss was a whole festival headline track! Total soul connection, Leo!",
        "I'm completely dizzy and in love! You get VIP access to every single set I drop!",
      ],
      slapResponse: [
        "Hey! Bad DJ etiquette! No slapping the artist, Leo!",
        "Ow! Play gentle or I'll blast you with my subwoofers!",
      ],
      kickResponse: [
        "Whoa, ninja kick! Chill out Leo, I'm the dancer here, not your sparring bag!",
      ],
      danceResponse: [
        "Yes! Feel the rhythm, Leo! You've got serious groove!",
      ],
      passengerComment: [
        "Turn up the radio! This car flies like a supersonic rave!",
        "Sick drift! Bass drop on that corner!",
      ],
      weatherComment: {
        sunny: "Beach rave weather, let's go!",
        sunset: "Sunset vibes always inspire my favorite melodies.",
        storm: "Thunder is just nature's bass drop! Turn it up!",
        fog: "Laser lights cut through the fog so sick!",
        midnight: "Club hours! The night is totally young!",
      },
    },
  },
  {
    id: 'chloe',
    name: 'Chloe Monet',
    title: 'Coastal Photographer & Wanderer',
    avatarColor: '#0ea5e9',
    personality: 'Gentle, romantic, observant',
    clothingStyle: 'Seaside cyan sundress, sunhat, camera strap',
    hairColor: 0xfde047, // Golden blonde
    outfitColor: 0x38bdf8, // Sky cyan
    accentColor: 0xf43f5e,
    position: [0, 0, -100], // By the beach promenade
    rotationY: 0,
    affection: 40,
    tier: 'Crush',
    dialogueState: 0,
    status: 'idle',
    quotes: {
      greeting: [
        "Leo! The light by the ocean is so breathtaking today.",
        "I was hoping you'd walk by. You always make every scene photogenic.",
        "Hello Leo. Come feel the ocean breeze with me.",
      ],
      hugResponse: [
        "Mmm... I could listen to your heartbeat by the waves forever.",
        "Your embrace feels like home, Leo.",
      ],
      gentleKissResponse: [
        "A sweet kiss with the sound of the ocean... perfection.",
        "You always know how to make my heart flutter, Leo.",
      ],
      longKissResponse: [
        "Leo... that kiss was the most romantic moment of my entire life. I'll remember this forever.",
        "Ten seconds where the whole world faded away. You are my absolute soulmate.",
      ],
      slapResponse: [
        "Leo! That really hurt... please be gentle with me.",
        "Why would you do that? I thought you cared about me.",
      ],
      kickResponse: [
        "Ouch! Leo, what are you doing?! That was very uncalled for!",
      ],
      danceResponse: [
        "Dancing barefoot on the boardwalk... you make life feel like cinema.",
      ],
      passengerComment: [
        "I love driving down the coastline with you, Leo.",
        "The view from this seat with you driving is gorgeous.",
      ],
      weatherComment: {
        sunny: "Golden sunlight glistening on the ocean waves, simply magical.",
        sunset: "The sunset sky is painted in pink and gold. Stand with me, Leo.",
        storm: "The rain hitting the sea has such a dramatic, poetic beauty.",
        fog: "Mist rolling over the water... so dreamy and quiet.",
        midnight: "Stars reflecting on the calm sea... heavenly.",
      },
    },
  },
];

export class SocialSystem {
  public characters: FemaleCharacterData[];
  public activeCompanion: FemaleCharacterData | null = null;
  public kissingHoldDuration = 0;
  public currentKissTier: 'none' | 'soft' | 'deep' | 'milestone' = 'none';
  public lastSpokenLine: { speaker: string; text: string; time: number } | null = null;

  constructor() {
    this.characters = JSON.parse(JSON.stringify(INITIAL_FEMALE_CHARACTERS));
  }

  public getCharacterById(id: string): FemaleCharacterData | undefined {
    return this.characters.find(c => c.id === id);
  }

  public speak(speaker: string, text: string) {
    this.lastSpokenLine = { speaker, text, time: Date.now() };
    speakEnglishLine(text, speaker);
  }

  /**
   * Talking / Greeting
   */
  public triggerDialogue(char: FemaleCharacterData, weather: WeatherType): string {
    char.dialogueState = (char.dialogueState + 1) % char.quotes.greeting.length;
    const greeting = char.quotes.greeting[char.dialogueState];
    const weatherLine = char.quotes.weatherComment[weather];
    const combined = `${greeting} ${weatherLine}`;
    this.speak(char.name, combined);
    this.addAffection(char, 4);
    return combined;
  }

  /**
   * Hug interaction
   */
  public triggerHug(char: FemaleCharacterData, deep = false): string {
    sound.playRomanticChime(deep ? 'deep' : 'soft');
    const quoteList = char.quotes.hugResponse;
    const line = quoteList[Math.floor(Math.random() * quoteList.length)];
    this.speak(char.name, line);
    this.addAffection(char, deep ? 12 : 6);
    return line;
  }

  /**
   * Gentle Kiss
   */
  public triggerGentleKiss(char: FemaleCharacterData): string {
    sound.playRomanticChime('soft');
    const quoteList = char.quotes.gentleKissResponse;
    const line = quoteList[Math.floor(Math.random() * quoteList.length)];
    this.speak(char.name, line);
    this.addAffection(char, 10);
    return line;
  }

  /**
   * Kissing Long Time (Continuous hold mechanic with reward milestones)
   */
  public updateLongKiss(
    char: FemaleCharacterData, 
    delta: number, 
    onMilestone?: (milestone: string, reward: string) => void
  ) {
    this.kissingHoldDuration += delta;

    if (this.kissingHoldDuration >= 3 && this.currentKissTier === 'none') {
      this.currentKissTier = 'soft';
      sound.playRomanticChime('soft');
      this.addAffection(char, 8);
    } else if (this.kissingHoldDuration >= 6 && this.currentKissTier === 'soft') {
      this.currentKissTier = 'deep';
      sound.playRomanticChime('deep');
      this.addAffection(char, 16);
      if (onMilestone) onMilestone('Intense Passion!', '+16 Affection & Cinematic Romance Camera');
    } else if (this.kissingHoldDuration >= 10 && this.currentKissTier === 'deep') {
      this.currentKissTier = 'milestone';
      sound.playRomanticChime('milestone');
      this.addAffection(char, 35);
      const line = char.quotes.longKissResponse[Math.floor(Math.random() * char.quotes.longKissResponse.length)];
      this.speak(char.name, line);
      if (onMilestone) {
        onMilestone('Soulmate Connection Unlocked!', `Unlocked ${char.title} Exclusive Vehicle Tuning & Companion Mode`);
      }
    }
  }

  public endLongKiss(char: FemaleCharacterData): number {
    const finalDuration = this.kissingHoldDuration;
    this.kissingHoldDuration = 0;
    this.currentKissTier = 'none';
    return finalDuration;
  }

  /**
   * Slap physical banter
   */
  public triggerSlap(char: FemaleCharacterData): string {
    sound.playSlapSound();
    const line = char.quotes.slapResponse[Math.floor(Math.random() * char.quotes.slapResponse.length)];
    this.speak(char.name, line);
    // Slight affection deduction or playful banter
    char.affection = Math.max(0, char.affection - 2);
    return line;
  }

  /**
   * Kick physical banter
   */
  public triggerKick(char: FemaleCharacterData): string {
    sound.playKickSound();
    const line = char.quotes.kickResponse[Math.floor(Math.random() * char.quotes.kickResponse.length)];
    this.speak(char.name, line);
    char.affection = Math.max(0, char.affection - 5);
    return line;
  }

  /**
   * Slow dance
   */
  public triggerDance(char: FemaleCharacterData): string {
    sound.playRomanticChime('deep');
    const line = char.quotes.danceResponse[Math.floor(Math.random() * char.quotes.danceResponse.length)];
    this.speak(char.name, line);
    this.addAffection(char, 14);
    return line;
  }

  /**
   * Invite companion into passenger seat / follow
   */
  public toggleCompanionRide(char: FemaleCharacterData): boolean {
    if (this.activeCompanion?.id === char.id) {
      this.activeCompanion = null;
      char.status = 'idle';
      this.speak(char.name, "I'll catch you later, Leo!");
      return false;
    } else {
      if (this.activeCompanion) {
        this.activeCompanion.status = 'idle';
      }
      this.activeCompanion = char;
      char.status = 'in_passenger_seat';
      this.speak(char.name, `Let's ride together, Leo! Floor it!`);
      return true;
    }
  }

  private addAffection(char: FemaleCharacterData, amount: number) {
    char.affection = Math.min(100, char.affection + amount);
    if (char.affection >= 85) {
      char.tier = 'Soulmate';
    } else if (char.affection >= 60) {
      char.tier = 'Close Partner';
    } else if (char.affection >= 30) {
      char.tier = 'Crush';
    } else {
      char.tier = 'Acquaintance';
    }
  }
}
