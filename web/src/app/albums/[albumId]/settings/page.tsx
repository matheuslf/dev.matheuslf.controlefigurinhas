import { AlbumSettingsClient } from "./settings-client";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function AlbumSettingsPage({ params }: PageProps) {
  const { albumId } = await params;
  return <AlbumSettingsClient albumId={albumId} />;
}
