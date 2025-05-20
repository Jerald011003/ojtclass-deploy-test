import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

console.log("UploadThing core.ts loaded");

export const ourFileRouter = {
  documentUploader: f({
    "image": { maxFileSize: "4MB" },
    "pdf": { maxFileSize: "16MB" },
    "text": { maxFileSize: "16MB" }
  })
    .middleware(async ({ req }) => {
      console.log("UploadThing middleware running");
      const { userId } = await auth();

      if (!userId) {
        console.log("UploadThing auth failed - no userId");
        throw new Error("Unauthorized");
      }

      console.log("UploadThing auth successful, userId:", userId);
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("UPLOAD COMPLETED:", file.url, "for user", metadata.userId);
      console.log("New UPLOADTHING URL format:", file.url);

      return {
        uploadedBy: metadata.userId,
        url: file.url
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;