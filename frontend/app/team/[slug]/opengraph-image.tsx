// app/team/[slug]/opengraph-image.tsx (for OG images)
import { ImageResponse } from 'next/og';

export const alt = 'Team Member Profile';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { slug: string } }) {
  // Fetch member data and generate OG image
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Custom OG image design */}
      </div>
    ),
    size
  );
}