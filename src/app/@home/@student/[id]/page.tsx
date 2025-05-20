import { Suspense } from 'react';
import { ClassroomDetailClient } from './components/ClassroomDetailClient';
import Loading from '~/components/Loading';

interface PageProps {
  params: {
    id: string;
  };
}

export default function StudentClassroomDetailPage({ params }: PageProps) {
  const { id } = params;
  
  return (
    <Suspense fallback={<Loading />}>
      <ClassroomDetailClient id={id} />
    </Suspense>
  );
}