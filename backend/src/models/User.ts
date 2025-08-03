import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserResources {
    food: number;
    wood: number;
    stone: number;
    iron: number;
    gems: number;
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    displayName: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: Date;
    gameStats: {
        gamesPlayed: number;
        gamesWon: number;
        totalBattlesWon: number;
        totalGoldCollected: number;
        totalOrbsOpened: number;
    };
    inventory: {
        gold: number;
        orbsCount: {
            common: number;
            uncommon: number;
            rare: number;
            veryRare: number;
            legendary: number;
        };
        resources: UserResources;
    };
    friends: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscore, and dash']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    avatar: {
        type: String,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    gameStats: {
        gamesPlayed: {
            type: Number,
            default: 0
        },
        gamesWon: {
            type: Number,
            default: 0
        },
        totalBattlesWon: {
            type: Number,
            default: 0
        },
        totalGoldCollected: {
            type: Number,
            default: 0
        },
        totalOrbsOpened: {
            type: Number,
            default: 0
        }
    },
    inventory: {
        gold: {
            type: Number,
            default: 100
        },
        orbsCount: {
            common: {
                type: Number,
                default: 0
            },
            uncommon: {
                type: Number,
                default: 0
            },
            rare: {
                type: Number,
                default: 0
            },
            veryRare: {
                type: Number,
                default: 0
            },
            legendary: {
                type: Number,
                default: 0
            }
        },
        resources: {
            food: {
                type: Number,
                default: 50  // Starting resources
            },
            wood: {
                type: Number,
                default: 100 // More wood to start building
            },
            stone: {
                type: Number,
                default: 75
            },
            iron: {
                type: Number,
                default: 25
            },
            gems: {
                type: Number,
                default: 0
            }
        }
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc: any, ret: any) {
            const { password, __v, ...userObject } = ret;
            return userObject;
        }
    }
});

// Index for performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ isOnline: 1 });

// Pre-save middleware to ensure resources are initialized
UserSchema.pre('save', function(this: IUser, next) {
    // Initialize resources if they don't exist
    if (!this.inventory.resources) {
        this.inventory.resources = {
            food: 50,
            wood: 100,
            stone: 75,
            iron: 25,
            gems: 0
        };
    }

    // Ensure all resource properties exist
    const defaultResources = {
        food: 50,
        wood: 100,
        stone: 75,
        iron: 25,
        gems: 0
    };

    for (const [resource, defaultValue] of Object.entries(defaultResources)) {
        if (this.inventory.resources[resource as keyof UserResources] === undefined) {
            (this.inventory.resources[resource as keyof UserResources] as number) = defaultValue;
        }
    }

    next();
});

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

export default mongoose.model<IUser>('User', UserSchema);
