'use client';

import { SignIn } from "@clerk/nextjs";

export function CustomSignIn() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          formFieldInput: 'rounded-md border-gray-300',
          formFieldLabel: 'font-medium text-gray-700',
          card: 'rounded-xl shadow-lg',
          rootBox: 'w-full',
          header: 'hidden',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          navbar: 'hidden',
          page: 'w-full flex justify-center items-center'
        },
        layout: {
          logoPlacement: 'inside',
          socialButtonsVariant: 'iconButton'
        }
      }}
      path="/sign-in"
      signUpUrl="/sign-up"
      routing="path"
      redirectUrl="/dashboard-redirect"
      afterSignInUrl="/dashboard-redirect"
    />
  );
}