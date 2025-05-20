import { createUploadthing } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Define different upload handlers for different file types and use cases
  
  // For profile pictures and small images
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await currentUser();
      
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
  
  // For documents (PDF, DOCX, etc.)
  document: f({
    "application/pdf": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 5
    },
  })
    .middleware(async ({ req }) => {
      const auth = getAuth(req);
      if (!auth.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      return { userId: auth.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
};

export type OurFileRouter = typeof ourFileRouter; 