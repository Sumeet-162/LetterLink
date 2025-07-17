import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';
import Friend from './src/models/Friend.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample test data with 20 realistic users
const sampleUsers = [
  {
    username: 'akira_tokyo',
    email: 'akira@letterlink.com',
    password: 'password123',
    name: 'Akira Tanaka',
    dateOfBirth: new Date('1998-03-15'),
    gender: 'Male',
    relationshipStatus: 'Single',
    languagesKnown: ['Japanese', 'English'],
    writingStyle: 'Deep and philosophical',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    bio: 'Philosophy student who loves nature and traditional Japanese culture.',
    interests: ['Philosophy', 'Nature', 'Photography', 'Traditional Arts', 'Tea Ceremony'],
    profileCompleted: true
  },
  {
    username: 'elena_prague',
    email: 'elena@letterlink.com',
    password: 'password123',
    name: 'Elena Novakova',
    dateOfBirth: new Date('1995-08-22'),
    gender: 'Female',
    relationshipStatus: 'In a relationship',
    languagesKnown: ['Czech', 'English', 'German'],
    writingStyle: 'Creative and artistic',
    country: 'Czech Republic',
    timezone: 'Europe/Prague',
    bio: 'Literature enthusiast and architect exploring the beauty of old European cities.',
    interests: ['Literature', 'Architecture', 'Travel', 'History', 'Classical Music'],
    profileCompleted: true
  },
  {
    username: 'marcus_sydney',
    email: 'marcus@letterlink.com',
    password: 'password123',
    name: 'Marcus Thompson',
    dateOfBirth: new Date('1992-11-08'),
    gender: 'Male',
    relationshipStatus: 'Single',
    languagesKnown: ['English'],
    writingStyle: 'Casual and friendly',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    bio: 'Outdoor enthusiast who loves surfing and exploring the Australian wilderness.',
    interests: ['Nature', 'Sports', 'Travel', 'Surfing', 'Wildlife'],
    profileCompleted: true
  },
  {
    username: 'sophia_milan',
    email: 'sophia@letterlink.com',
    password: 'password123',
    name: 'Sophia Rossi',
    dateOfBirth: new Date('1990-05-14'),
    gender: 'Female',
    relationshipStatus: 'Married',
    languagesKnown: ['Italian', 'English', 'French'],
    writingStyle: 'Creative and artistic',
    country: 'Italy',
    timezone: 'Europe/Rome',
    bio: 'Fashion designer and art lover from Milan who enjoys cooking and wine tasting.',
    interests: ['Fashion', 'Art', 'Cooking', 'Wine', 'Design'],
    profileCompleted: true
  },
  {
    username: 'lars_oslo',
    email: 'lars@letterlink.com',
    password: 'password123',
    name: 'Lars Andersen',
    dateOfBirth: new Date('1993-12-03'),
    gender: 'Male',
    relationshipStatus: 'Single',
    languagesKnown: ['Norwegian', 'English', 'Swedish'],
    writingStyle: 'Formal and professional',
    country: 'Norway',
    timezone: 'Europe/Oslo',
    bio: 'Software developer and hiking enthusiast exploring the Norwegian fjords.',
    interests: ['Technology', 'Hiking', 'Nature', 'Photography', 'Skiing'],
    profileCompleted: true
  },
  {
    username: 'maria_barcelona',
    email: 'maria@letterlink.com',
    password: 'password123',
    name: 'Maria Rodriguez',
    dateOfBirth: new Date('1996-07-18'),
    gender: 'Female',
    relationshipStatus: 'Single',
    languagesKnown: ['Spanish', 'English', 'Catalan'],
    writingStyle: 'Poetic and expressive',
    country: 'Spain',
    timezone: 'Europe/Madrid',
    bio: 'Dance instructor and flamenco performer passionate about Spanish culture.',
    interests: ['Dance', 'Music', 'Culture', 'Language', 'Travel'],
    profileCompleted: true
  },
  {
    username: 'chen_beijing',
    email: 'chen@letterlink.com',
    password: 'password123',
    name: 'Chen Wei',
    dateOfBirth: new Date('1987-01-25'),
    gender: 'Male',
    relationshipStatus: 'Married',
    languagesKnown: ['Chinese', 'English'],
    writingStyle: 'Deep and philosophical',
    country: 'China',
    timezone: 'Asia/Shanghai',
    bio: 'Traditional Chinese medicine practitioner and martial arts enthusiast.',
    interests: ['Medicine', 'Martial Arts', 'Philosophy', 'History', 'Tea'],
    profileCompleted: true
  },
  {
    username: 'amara_nairobi',
    email: 'amara@letterlink.com',
    password: 'password123',
    name: 'Amara Kimani',
    dateOfBirth: new Date('1991-09-12'),
    gender: 'Female',
    relationshipStatus: 'In a relationship',
    languagesKnown: ['English', 'Swahili'],
    writingStyle: 'Creative and artistic',
    country: 'Kenya',
    timezone: 'Africa/Nairobi',
    bio: 'Wildlife photographer and conservationist documenting African wildlife.',
    interests: ['Photography', 'Wildlife', 'Conservation', 'Nature', 'Travel'],
    profileCompleted: true
  },
  {
    username: 'diego_saopaulo',
    email: 'diego@letterlink.com',
    password: 'password123',
    name: 'Diego Santos',
    dateOfBirth: new Date('1994-04-30'),
    gender: 'Male',
    relationshipStatus: 'Single',
    languagesKnown: ['Portuguese', 'English', 'Spanish'],
    writingStyle: 'Humorous and light-hearted',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    bio: 'Musician and street artist bringing Brazilian rhythms to the world.',
    interests: ['Music', 'Art', 'Dance', 'Culture', 'Football'],
    profileCompleted: true
  },
  {
    username: 'aisha_cairo',
    email: 'aisha@letterlink.com',
    password: 'password123',
    name: 'Aisha Hassan',
    dateOfBirth: new Date('1988-10-07'),
    gender: 'Female',
    relationshipStatus: 'Divorced',
    languagesKnown: ['Arabic', 'English', 'French'],
    writingStyle: 'Formal and professional',
    country: 'Egypt',
    timezone: 'Africa/Cairo',
    bio: 'Archaeologist and history professor fascinated by ancient civilizations.',
    interests: ['History', 'Archaeology', 'Literature', 'Culture', 'Education'],
    profileCompleted: true
  },
  {
    username: 'olivier_paris',
    email: 'olivier@letterlink.com',
    password: 'password123',
    name: 'Olivier Dubois',
    dateOfBirth: new Date('1985-06-11'),
    gender: 'Male',
    relationshipStatus: 'Married',
    languagesKnown: ['French', 'English', 'Italian'],
    writingStyle: 'Casual and friendly',
    country: 'France',
    timezone: 'Europe/Paris',
    bio: 'Chef and food critic exploring culinary traditions around the world.',
    interests: ['Cooking', 'Food', 'Travel', 'Culture', 'Wine'],
    profileCompleted: true
  },
  {
    username: 'raj_mumbai',
    email: 'raj@letterlink.com',
    password: 'password123',
    name: 'Raj Patel',
    dateOfBirth: new Date('1989-02-28'),
    gender: 'Male',
    relationshipStatus: 'Single',
    languagesKnown: ['Hindi', 'English', 'Gujarati'],
    writingStyle: 'Deep and philosophical',
    country: 'India',
    timezone: 'Asia/Kolkata',
    bio: 'Bollywood screenwriter and yoga instructor sharing stories of modern India.',
    interests: ['Writing', 'Cinema', 'Yoga', 'Philosophy', 'Literature'],
    profileCompleted: true
  },
  {
    username: 'ingrid_stockholm',
    email: 'ingrid@letterlink.com',
    password: 'password123',
    name: 'Ingrid Larsson',
    dateOfBirth: new Date('1992-12-15'),
    gender: 'Female',
    relationshipStatus: 'In a relationship',
    languagesKnown: ['Swedish', 'English', 'Norwegian'],
    writingStyle: 'Formal and professional',
    country: 'Sweden',
    timezone: 'Europe/Stockholm',
    bio: 'Environmental scientist and sustainable living advocate from Stockholm.',
    interests: ['Environment', 'Science', 'Sustainability', 'Nature', 'Research'],
    profileCompleted: true
  },
  {
    username: 'hassan_istanbul',
    email: 'hassan@letterlink.com',
    password: 'password123',
    name: 'Hassan Özkan',
    dateOfBirth: new Date('1986-08-09'),
    gender: 'Male',
    relationshipStatus: 'Married',
    languagesKnown: ['Turkish', 'English', 'Arabic'],
    writingStyle: 'Poetic and expressive',
    country: 'Turkey',
    timezone: 'Europe/Istanbul',
    bio: 'Carpet weaver and cultural historian preserving Turkish craftsmanship.',
    interests: ['Crafts', 'History', 'Culture', 'Art', 'Traditions'],
    profileCompleted: true
  },
  {
    username: 'yuki_kyoto',
    email: 'yuki@letterlink.com',
    password: 'password123',
    name: 'Yuki Yamamoto',
    dateOfBirth: new Date('1997-04-03'),
    gender: 'Non-binary',
    relationshipStatus: 'Single',
    languagesKnown: ['Japanese', 'English'],
    writingStyle: 'Deep and philosophical',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    bio: 'Zen garden designer and mindfulness teacher from ancient Kyoto.',
    interests: ['Meditation', 'Gardens', 'Zen', 'Nature', 'Art'],
    profileCompleted: true
  },
  {
    username: 'carlos_lima',
    email: 'carlos@letterlink.com',
    password: 'password123',
    name: 'Carlos Mendoza',
    dateOfBirth: new Date('1990-11-20'),
    gender: 'Male',
    relationshipStatus: 'Single',
    languagesKnown: ['Spanish', 'English', 'Quechua'],
    writingStyle: 'Casual and friendly',
    country: 'Peru',
    timezone: 'America/Lima',
    bio: 'Mountain guide and adventure photographer exploring the Andes.',
    interests: ['Adventure', 'Photography', 'Mountains', 'Travel', 'Nature'],
    profileCompleted: true
  },
  {
    username: 'natasha_moscow',
    email: 'natasha@letterlink.com',
    password: 'password123',
    name: 'Natasha Volkov',
    dateOfBirth: new Date('1993-01-17'),
    gender: 'Female',
    relationshipStatus: 'It\'s complicated',
    languagesKnown: ['Russian', 'English', 'French'],
    writingStyle: 'Poetic and expressive',
    country: 'Russia',
    timezone: 'Europe/Moscow',
    bio: 'Ballet dancer and composer blending classical and modern art forms.',
    interests: ['Ballet', 'Music', 'Art', 'Performance', 'Culture'],
    profileCompleted: true
  },
  {
    username: 'kofi_accra',
    email: 'kofi@letterlink.com',
    password: 'password123',
    name: 'Kofi Asante',
    dateOfBirth: new Date('1988-05-26'),
    gender: 'Male',
    relationshipStatus: 'Married',
    languagesKnown: ['English', 'Twi', 'French'],
    writingStyle: 'Humorous and light-hearted',
    country: 'Ghana',
    timezone: 'Africa/Accra',
    bio: 'Drummer and storyteller keeping African oral traditions alive.',
    interests: ['Music', 'Storytelling', 'Culture', 'History', 'Community'],
    profileCompleted: true
  },
  {
    username: 'luna_vancouver',
    email: 'luna@letterlink.com',
    password: 'password123',
    name: 'Luna Chang',
    dateOfBirth: new Date('1995-09-04'),
    gender: 'Female',
    relationshipStatus: 'Single',
    languagesKnown: ['English', 'Chinese', 'French'],
    writingStyle: 'Formal and professional',
    country: 'Canada',
    timezone: 'America/Vancouver',
    bio: 'Marine biologist and ocean conservationist studying Pacific ecosystems.',
    interests: ['Marine Biology', 'Ocean', 'Conservation', 'Science', 'Nature'],
    profileCompleted: true
  },
  {
    username: 'testuser',
    email: 'test@letterlink.com',
    password: 'password123',
    name: 'Test User',
    dateOfBirth: new Date('1999-06-15'),
    gender: 'Prefer not to say',
    relationshipStatus: 'Single',
    languagesKnown: ['English'],
    writingStyle: 'Casual and friendly',
    country: 'United States',
    timezone: 'America/New_York',
    bio: 'A test user for the LetterLink application.',
    interests: ['Reading', 'Writing', 'Technology', 'Travel', 'Photography'],
    profileCompleted: true
  }
];

const createTestData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Letter.deleteMany({});
    await Friend.deleteMany({});
    
    console.log('Cleared existing data');

    // Create users
    const users = await User.create(sampleUsers);
    console.log('Created users:', users.map(u => u.username));

    // Create some letters between users (this will automatically create friendships)
    const letters = [];
    
    // Helper function to get random user
    const getRandomUser = (exclude = []) => {
      const available = users.filter(u => !exclude.includes(u._id.toString()));
      return available[Math.floor(Math.random() * available.length)];
    };

    // Create 15 sample letters between different users
    const letterTemplates = [
      {
        subject: 'Greetings from Tokyo',
        content: 'Hello! I hope this letter finds you well. I wanted to share some thoughts about the changing seasons here in Tokyo and how they inspire my photography. The cherry blossoms are particularly beautiful this year...',
        sender: 0, // Akira
        recipient: 1, // Elena
        daysAgo: 7
      },
      {
        subject: 'Architecture and Philosophy',
        content: 'Dear friend, Thank you for your beautiful letter! Your descriptions of the cherry blossoms made me think of the spring architecture here in Prague. The way light filters through the Gothic windows reminds me of your photography...',
        sender: 1, // Elena
        recipient: 0, // Akira
        daysAgo: 5,
        isReply: true
      },
      {
        subject: 'Adventures from Down Under',
        content: 'G\'day mate! Hope you\'re doing well. Just got back from an amazing surfing trip along the Gold Coast. The waves were incredible and I couldn\'t help but think about how vast our world is...',
        sender: 2, // Marcus
        recipient: 19, // Test user
        daysAgo: 3
      },
      {
        subject: 'Fashion and Art in Milan',
        content: 'Ciao! I\'ve been working on a new collection inspired by Renaissance art. The way colors and textures blend together in both fashion and classical paintings is fascinating...',
        sender: 3, // Sophia
        recipient: 10, // Olivier
        daysAgo: 4
      },
      {
        subject: 'Nordic Wilderness',
        content: 'Hei! The Norwegian fjords are absolutely breathtaking this time of year. I spent last weekend hiking through untouched wilderness and felt so connected to nature...',
        sender: 4, // Lars
        recipient: 12, // Ingrid
        daysAgo: 6
      },
      {
        subject: 'Flamenco and Passion',
        content: 'Hola! Just finished a performance at the Palau de la Música. The energy of flamenco never fails to move me. Each dance tells a story of passion and tradition...',
        sender: 5, // Maria
        recipient: 8, // Diego
        daysAgo: 2
      },
      {
        subject: 'Ancient Wisdom',
        content: 'Greetings from Beijing. I\'ve been studying ancient texts about traditional medicine and martial arts. The wisdom of our ancestors continues to guide modern practice...',
        sender: 6, // Chen
        recipient: 14, // Yuki
        daysAgo: 8
      },
      {
        subject: 'Wildlife Conservation',
        content: 'Jambo! Just returned from a safari in the Maasai Mara. The wildlife here is incredible, but conservation efforts are more important than ever...',
        sender: 7, // Amara
        recipient: 18, // Luna
        daysAgo: 5
      },
      {
        subject: 'Brazilian Rhythms',
        content: 'Olá! The streets of São Paulo are alive with music and art. I\'ve been working on a new song that blends traditional Brazilian rhythms with modern beats...',
        sender: 8, // Diego
        recipient: 5, // Maria
        daysAgo: 1
      },
      {
        subject: 'Ancient Civilizations',
        content: 'Ahlan wa sahlan! Discovered some fascinating artifacts near the pyramids. Each piece tells a story of how our ancestors lived and thought...',
        sender: 9, // Aisha
        recipient: 13, // Hassan
        daysAgo: 7
      },
      {
        subject: 'Culinary Adventures',
        content: 'Bonjour! Just tried the most amazing fusion of French and Asian cuisines. The way different cultures blend in food reflects our shared humanity...',
        sender: 10, // Olivier
        recipient: 6, // Chen
        daysAgo: 4
      },
      {
        subject: 'Bollywood Dreams',
        content: 'Namaste! Working on a new script about modern India. The contrast between ancient traditions and rapid modernization creates such compelling stories...',
        sender: 11, // Raj
        recipient: 9, // Aisha
        daysAgo: 6
      },
      {
        subject: 'Sustainable Living',
        content: 'Hej! Stockholm is leading the way in sustainable urban development. It\'s inspiring to see how cities can become more environmentally conscious...',
        sender: 12, // Ingrid
        recipient: 4, // Lars
        daysAgo: 3
      },
      {
        subject: 'Cultural Heritage',
        content: 'Merhaba! The traditional carpets I\'ve been weaving tell stories of Ottoman history. Each pattern has meaning passed down through generations...',
        sender: 13, // Hassan
        recipient: 17, // Kofi
        daysAgo: 9
      },
      {
        subject: 'Mountain Adventures',
        content: 'Hola! Just climbed one of the highest peaks in the Andes. The view from the top reminded me why I love adventure photography so much...',
        sender: 15, // Carlos
        recipient: 7, // Amara
        daysAgo: 2
      },
      // Add more letters to testuser for testing
      {
        subject: 'Welcome to LetterLink!',
        content: 'Hey there! Welcome to our wonderful community of letter writers. I hope you find some amazing connections here. Looking forward to exchanging stories and experiences with you!',
        sender: 0, // Akira
        recipient: 19, // Test user
        daysAgo: 1
      },
      {
        subject: 'Greetings from Prague',
        content: 'Hello! I noticed you joined recently. I wanted to reach out and say welcome! The community here is so warm and welcoming. I hope you enjoy writing and receiving letters as much as I do.',
        sender: 1, // Elena
        recipient: 19, // Test user
        daysAgo: 2
      },
      {
        subject: 'Photography and Nature',
        content: 'Hi! I saw your interests include photography and travel. I\'m a wildlife photographer from Kenya, and I\'d love to share some stories about the incredible animals I\'ve encountered. What kind of photography interests you most?',
        sender: 7, // Amara
        recipient: 19, // Test user
        daysAgo: 4
      }
    ];

    // Create letters from templates
    for (const template of letterTemplates) {
      const letter = {
        sender: users[template.sender]._id,
        recipient: users[template.recipient]._id,
        subject: template.subject,
        content: template.content,
        status: Math.random() > 0.3 ? 'read' : 'delivered',
        type: template.isReply ? 'reply' : 'delivery', // Changed from 'letter' to 'delivery'
        deliveredAt: new Date(Date.now() - template.daysAgo * 24 * 60 * 60 * 1000),
      };
      
      if (letter.status === 'read') {
        letter.readAt = new Date(Date.now() - (template.daysAgo - 1) * 24 * 60 * 60 * 1000);
      }
      
      letters.push(letter);
    }

    // Create letters
    const createdLetters = await Letter.create(letters);
    console.log('Created letters:', createdLetters.length);

    // Set reply reference for Elena's reply (if it exists)
    if (createdLetters.length >= 2) {
      const replyLetter = createdLetters.find(l => l.subject.includes('Architecture and Philosophy'));
      const originalLetter = createdLetters.find(l => l.subject.includes('Greetings from Tokyo'));
      if (replyLetter && originalLetter) {
        replyLetter.replyTo = originalLetter._id;
        await replyLetter.save();
      }
    }

    // Create friendships based on letter exchanges
    const friendships = [];
    const processedPairs = new Set();

    for (const letter of createdLetters) {
      const pairKey = [letter.sender.toString(), letter.recipient.toString()].sort().join('-');
      
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        
        // Find all letters between these two users
        const userLetters = createdLetters.filter(l => 
          (l.sender.toString() === letter.sender.toString() && l.recipient.toString() === letter.recipient.toString()) ||
          (l.sender.toString() === letter.recipient.toString() && l.recipient.toString() === letter.sender.toString())
        );
        
        // Get the most recent letter
        const recentLetter = userLetters.sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt))[0];
        
        // Determine activity type based on the most recent letter
        let activityType = 'sent';
        if (recentLetter.status === 'delivered') activityType = 'delivered';
        else if (recentLetter.status === 'read') activityType = 'received';
        
        // Check if there's a reply to the most recent letter
        const hasReply = userLetters.some(l => l.replyTo && l.replyTo.toString() === recentLetter._id.toString());
        if (hasReply) activityType = 'replied';
        
        friendships.push({
          user1: letter.sender,
          user2: letter.recipient,
          initiatedBy: letter.sender,
          lastActivity: recentLetter.deliveredAt,
          lastActivityType: activityType,
          lastLetter: recentLetter._id,
          letterCount: userLetters.length
        });
      }
    }

    await Friend.create(friendships);
    console.log('Created friendships:', friendships.length);

    console.log('✅ Test data created successfully!');
    console.log('Users created:', users.map(u => `${u.username} (${u.email})`));
    console.log('You can now login with any of these users using password: password123');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
connectDB().then(createTestData);
