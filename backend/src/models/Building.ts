import mongoose, { Document, Schema } from 'mongoose';

export interface BuildingConfig {
    type: string;
    name: string;
    description: string;
    category: 'resource' | 'military' | 'residential' | 'special';
    maxLevel: number;
    buildCost: {
        level: number;
        resources: Record<string, number>;
        time: number; // in seconds
    }[];
    production?: {
        level: number;
        resources: Record<string, number>;
        time: number; // production interval in seconds
    }[];
    unlockRequirements?: {
        townLevel?: number;
        buildings?: { type: string; level: number }[];
    };
}

export interface IBuilding extends Document {
    type: string;
    name: string;
    description: string;
    category: 'resource' | 'military' | 'residential' | 'special';
    maxLevel: number;
    buildCost: any[];
    production?: any[];
    unlockRequirements?: any;
    imageUrl?: string; // For AI-generated building images
    isActive: boolean;
}

const BuildingSchema = new Schema<IBuilding>({
    type: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['resource', 'military', 'residential', 'special']
    },
    maxLevel: { type: Number, required: true, min: 1, max: 20 },
    buildCost: [{
        level: { type: Number, required: true },
        resources: { type: Map, of: Number },
        time: { type: Number, required: true }
    }],
    production: [{
        level: { type: Number, required: true },
        resources: { type: Map, of: Number },
        time: { type: Number, required: true }
    }],
    unlockRequirements: {
        townLevel: { type: Number },
        buildings: [{
            type: { type: String },
            level: { type: Number }
        }]
    },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model<IBuilding>('Building', BuildingSchema);
