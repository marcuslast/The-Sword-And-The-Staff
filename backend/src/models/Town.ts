import mongoose, { Document, Schema } from 'mongoose';

export interface BuildingPosition {
    x: number;
    y: number;
    type: string;
    level: number;
    lastCollected?: Date;
    // build (construction) timers/flags
    buildStartTime?: Date;
    buildEndTime?: Date;
    isBuilding?: boolean;
    // upgrade timers/flags
    upgradeStartTime?: Date;
    upgradeEndTime?: Date;
    isUpgrading?: boolean;
}

export interface ITown extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    level: number;
    mapSize: {
        width: number;
        height: number;
    };
    buildings: BuildingPosition[];
    layout: string; // JSON string of the full map layout
    lastResourceCollection: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BuildingPositionSchema = new Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    type: {
        type: String,
        required: true,
        enum: [
            // Basic
            'empty',

            // Special buildings
            'townhall', 'market', 'vault',

            // Resource buildings
            'house', 'mansion', 'farm', 'mine', 'lumbermill', 'quarry', 'gem_mine',

            // Military buildings
            'barracks', 'archery_range', 'siege_workshop', 'warrior_lodge',
            'stable', 'training_grounds', 'spy_den',

            // Defensive buildings
            'wall', 'tower'
        ]
    },
    level: { type: Number, default: 1, min: 0, max: 30 },
    lastCollected: { type: Date, default: Date.now },

    // construction
    buildStartTime: { type: Date },
    buildEndTime: { type: Date },
    isBuilding: { type: Boolean, default: false },

    // upgrade
    upgradeStartTime: { type: Date },
    upgradeEndTime: { type: Date },
    isUpgrading: { type: Boolean, default: false }
});

const TownSchema = new Schema<ITown>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 50,
        default: 'My Town'
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 20
    },
    mapSize: {
        width: { type: Number, default: 10, min: 8, max: 20 },
        height: { type: Number, default: 8, min: 6, max: 16 }
    },
    buildings: [BuildingPositionSchema],
    layout: {
        type: String,
        default: ''
    },
    lastResourceCollection: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

TownSchema.index({ userId: 1 });

export default mongoose.model<ITown>('Town', TownSchema);
