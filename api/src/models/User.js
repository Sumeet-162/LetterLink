import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  // Profile fields
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: false, // Not required during signup, required during profile completion
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty during signup
        // Must be at least 13 years old
        const today = new Date();
        const minAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        return value <= minAge;
      },
      message: 'You must be at least 13 years old to register'
    }
  },
  gender: {
    type: String,
    required: false, // Not required during signup
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    trim: true
  },
  relationshipStatus: {
    type: String,
    required: false, // Not required during signup
    enum: ['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed', 'It\'s complicated', 'Prefer not to say'],
    trim: true
  },
  languagesKnown: [{
    type: String,
    trim: true
  }],
  writingStyle: {
    type: String,
    required: false, // Not required during signup
    enum: ['Casual and friendly', 'Formal and professional', 'Deep and philosophical', 'Creative and artistic', 'Humorous and light-hearted', 'Poetic and expressive'],
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [300, 'Bio cannot be more than 300 characters']
  },
  interests: [{
    type: String,
    trim: true
  }],
  profilePicture: {
    type: String,
    default: null
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  letterPreferences: {
    receiveLetters: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    deliveryDelay: {
      type: Number,
      default: 0 // in hours
    }
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add validation for languagesKnown array during profile completion only
userSchema.path('languagesKnown').validate(function(value) {
  // If profile is marked as completed, require at least one language
  if (this.profileCompleted && (!value || value.length === 0)) {
    return false;
  }
  return true;
}, 'At least one language must be specified for completed profiles');

// Virtual field to calculate age from date of birth
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', function(next) {
  console.log('Attempting to save user:', this.toObject());
  next();
});

const User = mongoose.model('User', userSchema);

console.log('User model initialized with schema:', userSchema.obj);

export default User;
