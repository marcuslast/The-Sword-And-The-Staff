import mongoose, { Document, Schema } from 'mongoose';

export interface ITile {
    q: number;
    r: number;
    terrain: string;
    owner?: {
        id: string;
        name: string;
        color: string;
    };
    resources?: string[];
    buildings?: string[];
    armies?: {
        userId: string;
        units: Record<string, number>;
    }[];
}

export interface IWorldMap extends Document {
    tiles: ITile[];
    mapSize: number;
    lastUpdated: Date;
    version: number;
}

const TileSchema = new Schema({
    q: { type: Number, required: true },
    r: { type: Number, required: true },
    terrain: {
        type: String,
        required: true,
        enum: ['grass', 'grass_rocks', 'forest', 'dense_forest', 'rocks', 'mountains', 'snowy_mountains', 'water', 'castle', 'pond']
    },
    owner: {
        id: String,
        name: String,
        color: String
    },
    resources: [String],
    buildings: [String],
    armies: [{
        userId: String,
        units: {
            type: Map,
            of: Number
        }
    }]
});

const WorldMapSchema = new Schema({
    tiles: [TileSchema],
    mapSize: {
        type: Number,
        default: 30,
        min: 10,
        max: 100
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Index for efficient tile queries
WorldMapSchema.index({ 'tiles.q': 1, 'tiles.r': 1 });
WorldMapSchema.index({ 'tiles.owner.id': 1 });

export default mongoose.model<IWorldMap>('WorldMap', WorldMapSchema);
