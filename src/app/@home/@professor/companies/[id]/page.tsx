import CompanyClassroomDetailsClient from './components/CompanyClassroomDetailsClient';

type PageParams = Promise<{ id: string }>;

export default async function CompanyClassroomDetailsPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  return <CompanyClassroomDetailsClient id={id} />;
} 