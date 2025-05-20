import EditCompanyClassroomClient from './EditCompanyClassroomClient';

type PageParams = Promise<{ id: string }>;

export default async function EditCompanyClassroomPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  return <EditCompanyClassroomClient id={id} />;
} 