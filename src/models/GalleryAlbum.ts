import { Schema, model, type Document, type Types } from "mongoose";

export interface IGalleryImage {
  _id: Types.ObjectId;
  url: string;
  caption?: string;
}

export interface IGalleryAlbum extends Document {
  title: string;
  coverImage?: string;
  images: IGalleryImage[];
  relatedActivity?: Types.ObjectId;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  url: { type: String, required: true },
  caption: { type: String, trim: true },
});

const galleryAlbumSchema = new Schema<IGalleryAlbum>(
  {
    title: { type: String, required: true, trim: true },
    coverImage: { type: String },
    images: { type: [galleryImageSchema], default: [] },
    relatedActivity: { type: Schema.Types.ObjectId, ref: "Activity" },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<IGalleryAlbum>("GalleryAlbum", galleryAlbumSchema);
