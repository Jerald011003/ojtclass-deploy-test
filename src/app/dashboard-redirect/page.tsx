// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@clerk/nextjs';
// import { Loader2 } from 'lucide-react';

// export default function DashboardRedirect() {
//   const router = useRouter();
//   const { isLoaded } = useAuth();

//   useEffect(() => {
//     if (isLoaded) {
//       router.push('/');
//     }
//   }, [isLoaded, router]);

//   return (
//     <div className="h-screen flex flex-col items-center justify-center">
//       <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
//     </div>
//   );
// }