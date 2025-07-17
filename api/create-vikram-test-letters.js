import mongoose from 'mongoose';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letterlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestLettersForVikram = async () => {
  try {
    console.log('🚀 Creating test letters for vikram...');

    // Find or create the vikram user
    let vikramUser = await User.findOne({ username: 'vikram' });
    
    if (!vikramUser) {
      console.log('👤 Creating vikram user...');
      vikramUser = new User({
        username: 'vikram',
        email: 'vikramfake@gmail.com',
        password: 'testpassword123', // This will be hashed by the pre-save hook
        name: 'Vikram Test',
        country: 'India',
        timezone: 'Asia/Kolkata',
        bio: 'Test account for freemium letter experience',
        profileCompleted: true,
      });
      await vikramUser.save();
      console.log('✅ Created vikram user');
    } else {
      console.log('✅ Found existing vikram user:', vikramUser.name, vikramUser.email);
    }

    // Clear any existing letters for vikram to avoid duplicates
    await Letter.deleteMany({ recipient: vikramUser._id });
    console.log('🗑️ Cleared existing letters for vikram');

    // Find some existing users to be the senders (excluding vikram)
    const senderUsers = await User.find({ 
      username: { $ne: 'vikram' } 
    }).limit(6);

    if (senderUsers.length === 0) {
      console.log('⚠️ No other users found. Creating some sender users...');
      
      // Create test sender users (6 total for 6 letters)
      const testSenders = [
        {
          name: 'Sofia Rodriguez',
          username: 'sofia_madrid',
          email: 'sofia@example.com',
          country: 'Spain',
          interests: ['Literature', 'Art', 'Travel', 'Food'],
        },
        {
          name: 'Hiroshi Tanaka',
          username: 'hiroshi_tokyo',
          email: 'hiroshi@example.com',
          country: 'Japan',
          interests: ['Philosophy', 'Nature', 'Photography', 'Culture'],
        },
        {
          name: 'Emma Thompson',
          username: 'emma_london',
          email: 'emma@example.com',
          country: 'United Kingdom',
          interests: ['Books', 'History', 'Writing', 'Music'],
        },
        {
          name: 'Lucas Silva',
          username: 'lucas_brazil',
          email: 'lucas@example.com',
          country: 'Brazil',
          interests: ['Sports', 'Travel', 'Culture', 'Dancing'],
        },
        {
          name: 'Klaus Müller',
          username: 'klaus_swiss',
          email: 'klaus@example.com',
          country: 'Switzerland',
          interests: ['Adventure', 'Mountains', 'Nature', 'Photography'],
        },
        {
          name: 'Astrid Nordahl',
          username: 'astrid_norway',
          email: 'astrid@example.com',
          country: 'Norway',
          interests: ['Science', 'Nature', 'Climate', 'Arctic', 'Research'],
        }
      ];

      for (const senderData of testSenders) {
        const existingUser = await User.findOne({ username: senderData.username });
        if (!existingUser) {
          const newUser = new User({
            ...senderData,
            password: 'hashedpassword123', // This would be properly hashed in real scenario
          });
          await newUser.save();
          senderUsers.push(newUser);
          console.log(`✅ Created sender user: ${senderData.name}`);
        } else {
          senderUsers.push(existingUser);
        }
      }
    }

    console.log(`✅ Found ${senderUsers.length} sender users`);

    // Create test letters for vikram - 3 free + 3 premium (locked until replies)
    const testLetters = [
      // FREE LETTERS (3) - Available immediately
      {
        subject: 'Greetings from Madrid!',
        content: `Hello friend!

I hope this letter finds you in good spirits. I'm writing to you from the beautiful city of Madrid, where the summer evenings are filled with the sound of laughter from the plazas below my balcony.

I've been thinking a lot about the connections we make across borders and languages. There's something magical about sharing thoughts with someone you've never met, don't you think?

I'm an art student here, and today I visited the Prado Museum. Standing before Velázquez's Las Meninas, I was struck by how art transcends time - much like these letters we exchange transcend distance.

What brings you joy in your daily life? I'd love to hear about your world.

With warm regards from Spain,
Sofia`,
        senderIndex: 0,
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isPremium: false
      },
      {
        subject: 'Reflections from a Tokyo Garden',
        content: `Dear friend,

I write to you from a small garden in Tokyo, where I come to find peace amidst the bustling city. The cherry blossoms have long since fallen, but the memory of their beauty lingers.

In Japanese, we have a concept called "mono no aware" - the bittersweet awareness of the impermanence of all things. I think of this often when writing letters like these. Each exchange is a brief moment of connection in the vast tapestry of human experience.

I work as a photographer, capturing the quiet moments that others might overlook - the way morning light filters through bamboo leaves, the concentrated expression of an elderly man practicing calligraphy in the park.

Photography and letter-writing share something in common: they both seek to preserve moments, to create lasting connections despite the passage of time.

What moments in your life do you find worth preserving?

With contemplation and respect,
Hiroshi`,
        senderIndex: 1,
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isPremium: false
      },
      {
        subject: 'A Writer\'s Musings from London',
        content: `My dear correspondent,

It's a rainy Tuesday afternoon in London, and I'm sitting in my favorite café near the British Library, watching the world go by through rain-streaked windows. There's something about the rhythm of rain that makes me contemplative and eager to write.

I'm working on my first novel - a story about unlikely friendships formed through letters, actually! Your random match letter system reminds me so much of the old days when pen pals were common, when the arrival of a letter was an event worth celebrating.

I've been wondering: in our digital age, what draws people back to the intimacy of letter-writing? Is it the deliberate pace? The thoughtfulness it requires? Or perhaps the romance of knowing that someone, somewhere, took time from their day specifically to reach out to you?

I'd love to hear your thoughts on this. Do you find letter-writing different from other forms of communication?

The rain has stopped now, and a shaft of sunlight has broken through the clouds. I take it as a good omen for this letter finding its way to you.

Warmly yours,
Emma`,
        senderIndex: 2,
        deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        isPremium: false
      },
      
      // PREMIUM LETTERS (3) - Locked until user replies to the 3 free letters
      {
        subject: 'Sunshine and Stories from Brazil',
        content: `Olá, my friend!

I'm writing to you from Copacabana beach in Rio de Janeiro, where the sun is setting over the ocean and painting the sky in shades of orange and pink that would make any artist weep with joy.

Life in Brazil is all about connection - to family, to friends, to music, to the natural world around us. We have a saying here: "A vida é uma festa" - life is a party. But I think it's more than that. Life is a dance, and sometimes we need partners from far away to help us learn new steps.

I work as a football coach for local kids, and I see every day how sports can bring people together regardless of language or background. A smile, a high-five, a shared goal - these things need no translation.

I'm curious about where you're from and what brings you joy. Do you have traditions in your country that celebrate connection and community? I'd love to learn about your culture and share more about mine.

The stars are coming out now, the same stars you'll see tonight from wherever you are. We're all under the same sky, sharing the same moment, even across the miles.

Com muito carinho (with much affection),
Lucas`,
        senderIndex: 3,
        deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        isPremium: true,
        isLocked: true
      },
      {
        subject: 'Alpine Adventures from Switzerland',
        content: `Guten Tag, dear friend!

I'm writing this letter from a mountain hut high in the Swiss Alps, where I work as a mountain guide during the summer months. The view from here is breathtaking - endless peaks stretching to the horizon, and valleys filled with morning mist.

Yesterday, I guided a group of climbers to the summit of a 4000-meter peak. At the top, we shared stories from our different countries while watching the sunrise paint the mountains gold. One climber was from your part of the world, and I thought of you.

There's something about mountains that puts life in perspective. Up here, away from the noise of civilization, you realize how connected we all are - to nature, to each other, to something greater than ourselves.

I collect stories from all the people I guide. Each person carries tales of their homeland, their dreams, their adventures. Would you share yours with me? What landscapes shape your soul?

The stars here shine brighter than anywhere else. Tonight, I'll look up and remember that we share the same sky.

Mit freundlichen Grüßen (with friendly greetings),
Klaus Müller`,
        senderIndex: 4, // Klaus Müller
        deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isPremium: true,
        isLocked: true
      },
      {
        subject: 'Northern Lights and Arctic Dreams',
        content: `Hei, my distant friend!

I'm writing to you from northern Norway, above the Arctic Circle, where the winter nights are long and the aurora borealis dances across the sky in ribbons of green and purple light.

I work as a researcher studying climate change in the Arctic, but tonight I'm not thinking about data or graphs. I'm thinking about wonder - the kind that fills you when you witness something truly magical, like the northern lights reflecting off the snow-covered landscape.

The Sami people, who have lived here for thousands of years, have many legends about the aurora. They say the lights are the souls of the departed dancing in the sky, celebrating life and connection across all boundaries - even death itself.

In this land of extremes - where summer brings endless daylight and winter brings endless night - you learn to appreciate contrasts, to find beauty in both light and darkness.

I wonder what natural wonders surround you? What sights in your corner of the world fill you with awe and remind you of life's magic?

The aurora is particularly bright tonight. I'll watch it dance and think of new friends in far-off places.

Vennlig hilsen (kind regards),
Astrid Nordahl`,
        senderIndex: 5, // Astrid Nordahl
        deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isPremium: true,
        isLocked: true
      }
    ];

    // Create the letters in the database
    const createdLetters = [];
    for (let i = 0; i < testLetters.length; i++) {
      const letterData = testLetters[i];
      const sender = senderUsers[letterData.senderIndex];
      
      if (!sender) {
        console.log(`⚠️ Skipping letter ${i + 1} - no sender available`);
        continue;
      }

      const letter = new Letter({
        subject: letterData.subject,
        content: letterData.content,
        sender: sender._id,
        recipient: vikramUser._id,
        status: 'delivered', // All letters are delivered, but premium ones are locked
        type: 'delivery',
        deliveredAt: letterData.deliveredAt,
        isPremium: letterData.isPremium || false,
        isLocked: letterData.isLocked || false,
      });

      await letter.save();
      createdLetters.push(letter);
      
      const statusText = letterData.isPremium && letterData.isLocked ? '(PREMIUM - LOCKED)' : '(FREE)';
      console.log(`✅ Created letter ${i + 1}: "${letterData.subject}" from ${sender.name} ${statusText}`);
    }

    console.log(`\n🎉 Successfully created ${createdLetters.length} test letters for vikram!`);
    console.log('📧 Letters created:');
    createdLetters.forEach((letter, index) => {
      const sender = senderUsers.find(u => u._id.equals(letter.sender));
      console.log(`   ${index + 1}. "${letter.subject}" from ${sender?.name} (${sender?.country})`);
    });

    console.log('\n✨ vikram should now see these letters in the inbox!');
    console.log('🔄 Refresh the inbox page to see the new letters.');

  } catch (error) {
    console.error('❌ Error creating test letters:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the script
createTestLettersForVikram();
