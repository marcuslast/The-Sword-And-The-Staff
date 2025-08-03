import mongoose, { Document, Schema } from 'mongoose';

// Define resource types that can appear in orbs
export type ResourceType = 'food' | 'wood' | 'stone' | 'iron' | 'gold' | 'gems';

export type OrbRarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';

export interface OrbItem {
    type: 'resource' | 'equipment'; // For now focusing on resources
    resourceType?: ResourceType; // Only present if type is 'resource'
    quantity: number;
    value?: number; // Optional value in gold equivalent
}

export interface OrbContents {
    gold: number;
    items: OrbItem[];
}

export interface IOrb extends Document {
    type: string;
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rarity: OrbRarity;
    isOpened: boolean;
    openedAt?: Date;
    contents?: OrbContents;
    createdAt: Date;
    updatedAt: Date;
}

const OrbSchema = new Schema<IOrb>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'very rare', 'legendary'],
        required: true
    },
    isOpened: {
        type: Boolean,
        default: false
    },
    openedAt: {
        type: Date,
        default: null
    },
    contents: {
        gold: {
            type: Number,
            default: 0
        },
        items: [{
            type: {
                type: String,
                enum: ['resource', 'equipment'],
                required: true
            },
            resourceType: {
                type: String,
                enum: ['food', 'wood', 'stone', 'iron', 'gold', 'gems'],
                required: function() {
                    return this.type === 'resource';
                }
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            value: {
                type: Number,
                min: 0
            }
        }]
    }
}, {
    timestamps: true
});

// Indexes for performance
OrbSchema.index({ userId: 1, isOpened: 1 });
OrbSchema.index({ rarity: 1 });

export default mongoose.model<IOrb>('Orb', OrbSchema);
