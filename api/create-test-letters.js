import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';

dotenv.config();

// Test users data
const testUsers = [
  {
    username: 'mountain_explorer',
    email: 'explorer@example.com',
    password: 'password123',
    name: 'Elena Martinez',
    country: 'Spain',
    timezone: 'Europe/Madrid',
    interests: ['Travel', 'Nature', 'Photography', 'Culture']
  },
  {
    username: 'bookworm_tokyo',
    email: 'bookworm@example.com',
    password: 'password123',
    name: 'Kenji Nakamura',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    interests: ['Literature', 'Philosophy', 'Art', 'Culture']
  },
  {
    username: 'lighthouse_keeper',
    email: 'lighthouse@example.com',
    password: 'password123',
    name: 'Seamus O\'Connor',
    country: 'Ireland',
    timezone: 'Europe/Dublin',
    interests: ['Literature', 'Nature', 'History', 'Writing']
  },
  {
    username: 'desert_wanderer',
    email: 'wanderer@example.com',
    password: 'password123',
    name: 'Amara Hassan',
    country: 'Morocco',
    timezone: 'Africa/Casablanca',
    interests: ['Travel', 'Philosophy', 'Culture', 'Languages']
  },
  {
    username: 'fjord_artist',
    email: 'artist@example.com',
    password: 'password123',
    name: 'Lars Andersen',
    country: 'Norway',
    timezone: 'Europe/Oslo',
    interests: ['Art', 'Nature', 'Photography', 'Music']
  },
  {
    username: 'cafe_philosopher',
    email: 'philosopher@example.com',
    password: 'password123',
    name: 'Sophie Laurent',
    country: 'France',
    timezone: 'Europe/Paris',
    interests: ['Philosophy', 'Literature', 'Culture', 'Food']
  }
];

// Test letters data
const testLetters = [
  {
    senderUsername: 'mountain_explorer',
    subject: 'Stories from the Pyrenees',
    content: `Dear friend,

I'm writing this from a small mountain village in the Pyrenees, where the air is crisp and the stars shine brighter than anywhere I've ever been. Today I hiked to an ancient stone bridge that has connected two valleys for over 800 years.

There's something profound about walking in the footsteps of countless others who came before us. Each stone of this bridge was placed by hands that have long since turned to dust, yet their creation endures, serving travelers like you and me.

I've been thinking about permanence and impermanence lately. We live such brief lives, yet we have the power to create things that outlast us - bridges, letters, memories, kindness. What would you choose to build that might last beyond your years?

The shepherd I met today told me that the mountain doesn't care about our plans - it teaches us patience and humility. I think there's wisdom in that. Sometimes the best journeys are the ones where we lose our way and find something unexpected.

I hope this letter finds you well, wherever you may be in this beautiful, chaotic world.

With warm regards from the mountains,
Elena`
  },
  {
    senderUsername: 'bookworm_tokyo',
    subject: 'Midnight Reflections in Shibuya',
    content: `Hello there,

It's 2 AM here in Tokyo, and I'm sitting in an all-night café in Shibuya, watching the city that never truly sleeps. The neon signs paint everything in electric blues and pinks, and even at this hour, people are walking with purpose to destinations I can only imagine.

I just finished reading Murakami's "Hard-Boiled Wonderland and the End of the World" for the third time. Each reading reveals new layers, like looking at the same cityscape through different windows. Do you ever find that books change depending on when in your life you encounter them?

There's a businessman at the table next to me who's been here for two hours, sketching something in a notebook. Not work - art. Tiny, detailed drawings of the people passing by outside. It makes me wonder what secret passions live inside all of us, waiting for quiet moments like this to emerge.

In Japanese, there's a concept called 'mono no aware' - the bittersweet awareness of the impermanence of all things. Tonight, watching this city pulse with life, I feel it deeply. Nothing lasts forever, and perhaps that's what makes everything beautiful.

What keeps you awake at night? What thoughts visit you in the quiet hours?

From the sleepless heart of Tokyo,
Kenji`
  },
  {
    senderUsername: 'lighthouse_keeper',
    subject: 'Letters from the Edge of the World',
    content: `My dear correspondent,

For thirty years, I've tended the lighthouse on these rugged Irish cliffs, guiding ships safely through treacherous waters. Tonight, as storm winds howl outside my small quarters, I write to you about the storms we weather within ourselves.

This lighthouse has seen countless nights like this - wild Atlantic gales that test its foundation, waves that crash against the rocks below with the fury of ancient gods. Yet it stands firm, its light cutting through darkness and fog, offering hope to those who need guidance most.

I've learned that people are much like ships navigating by lighthouse beams. We all face storms - doubt, fear, loss, uncertainty. But there's always someone willing to be a light for others, to stand firm when the winds howl and offer guidance through the darkness.

Yesterday, a young couple thanked me for the light that helped them navigate safely to shore during their first sailing adventure. They had no idea that their gratitude was the light I needed that day, having just received news of my sister's passing.

We are all lighthouse keepers in our own way, and ships seeking safe harbor in turn. Tonight, I'm grateful for the storms that taught me resilience and the calm seas that taught me peace.

May you find both adventure and safe harbor in your journeys.

From the edge of the world,
Seamus`
  },
  {
    senderUsername: 'desert_wanderer',
    subject: 'Lessons from the Sahara',
    content: `Peace be with you, friend,

I write this letter while sitting beneath a blanket of stars in the Sahara, where the silence is so complete you can hear your own heartbeat. The Berber guide who brought me here says the desert is the greatest teacher - it shows us what we truly need and what we can live without.

Today we walked for hours without seeing another soul, just endless dunes shifting with the wind. My guide told me that the Tuareg people have dozens of words for different types of sand, different qualities of silence, different shades of blue in the sky. Language shapes how we see the world, doesn't it?

There's a proverb here: "The desert is a dictionary written in sand." Each grain tells a story of mountains worn down by time, of ancient seas that once covered this land, of winds that have traveled the world. We are all made of such stories - fragments of everywhere we've been, everyone we've loved, every lesson that has shaped us.

In the city, we accumulate so many things, thinking they define us. But here, with only water, food, and shelter from the sun, I remember what wealth really means. It's the ability to sit in perfect silence with a stranger and feel complete understanding. It's water when you're thirsty. It's the laughter of children echoing across dunes at sunset.

What does your inner desert look like? What would remain if everything else was stripped away?

Under the eternal stars,
Amara`
  },
  {
    senderUsername: 'fjord_artist',
    subject: 'Painting the Light',
    content: `Dear fellow dreamer,

I'm writing from my small studio overlooking the Geirangerfjord, where the light changes every few minutes like nature's own art exhibition. This morning, the fjord was mirror-still, reflecting the waterfalls so perfectly I couldn't tell where the world ended and its reflection began.

As an artist, I've spent years trying to capture light - the way it dances on water, filters through forest, transforms ordinary moments into something magical. But I've learned that the most beautiful light isn't something you can paint; it's something you feel when human hearts connect across distance.

My grandmother used to say that every person carries their own northern lights inside them - invisible most of the time, but brilliant when they share their true selves with others. I see this light in the old fisherman who waves to me each morning, in the children playing by the water's edge, in letters from strangers like you.

Today I'm painting the view from my window, but really I'm trying to paint the feeling of being alive in this moment, grateful for eyes that see beauty and hands that can create. Art isn't about perfect technique - it's about honest expression of what moves us.

What moves you to create? What light do you carry inside that the world needs to see?

From the land of endless light,
Lars`
  },
  {
    senderUsername: 'cafe_philosopher',
    subject: 'Questions Over Coffee',
    content: `Bonjour mon ami,

I'm writing from my favorite café in Montmartre, where Picasso and Renoir once debated art over wine, and where I come each morning to ponder life's beautiful mysteries over café au lait and fresh croissants.

Today an elderly man at the next table was reading Sartre and chuckling to himself. When I asked what amused him, he said, "I spent my youth taking existentialism so seriously, and now I realize the most rebellious thing we can do is simply be happy." His laughter was contagious.

This got me thinking about all the questions that consume us when we're young: What is the meaning of life? How should we live? What is truth? But perhaps the answers aren't found in philosophy books - they're discovered in small moments of connection, in acts of kindness, in the taste of perfectly ripe strawberries, in letters shared between strangers.

The French have a phrase: "joie de vivre" - the joy of living. It's not about constant happiness, but about embracing the full spectrum of human experience with curiosity and grace. Pain teaches us empathy. Beauty teaches us gratitude. Love teaches us what truly matters.

I believe we are all philosophers, whether we know it or not. Every choice we make, every kindness we offer, every moment we pause to wonder at existence - these are philosophical acts.

What questions keep you curious about life? What brings you joie de vivre?

With philosophical wanderings,
Sophie`
  }
];

async function createTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink');
    console.log('Connected to MongoDB');

    // Get your user ID (assuming you're the recipient)
    const yourUser = await User.findOne().sort({ _id: -1 }); // Get the most recently created user (likely you)
    if (!yourUser) {
      console.error('No user found. Please create a user account first.');
      process.exit(1);
    }
    console.log(`Found recipient user: ${yourUser.username} (${yourUser.name})`);

    // Create test users
    console.log('Creating test users...');
    const createdUsers = [];
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`Created user: ${userData.username}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${userData.username}`);
      }
    }

    // Create test letters to your inbox
    console.log('Creating test letters...');
    let letterCount = 0;
    
    for (const letterData of testLetters) {
      const sender = createdUsers.find(user => user.username === letterData.senderUsername);
      if (!sender) {
        console.log(`Sender not found: ${letterData.senderUsername}`);
        continue;
      }

      // Check if letter already exists
      const existingLetter = await Letter.findOne({ 
        sender: sender._id, 
        recipient: yourUser._id, 
        subject: letterData.subject 
      });
      
      if (!existingLetter) {
        const letter = new Letter({
          sender: sender._id,
          recipient: yourUser._id,
          subject: letterData.subject,
          content: letterData.content,
          status: 'delivered',
          type: 'delivery', // Changed from 'letter' to 'delivery'
          deliveredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random delivery time within last week
        });
        
        await letter.save();
        letterCount++;
        console.log(`Created letter: "${letterData.subject}" from ${sender.name}`);
      } else {
        console.log(`Letter already exists: "${letterData.subject}"`);
      }
    }

    console.log(`\n✅ Test data creation complete!`);
    console.log(`📧 Created ${letterCount} new letters for ${yourUser.name}`);
    console.log(`👥 Created ${createdUsers.length} test users`);
    console.log(`\nRefresh your inbox to see the new letters!`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

createTestData();
