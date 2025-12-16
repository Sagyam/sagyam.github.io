import { ImageResponse } from 'next/og';
import { navigation, profile } from '@/lib/data';

export const runtime = 'edge';
export const revalidate = 86400; // Cache for 1 day (86400 seconds)

export const alt = `${profile.name} | ${profile.title}`;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('failed to load font data');
}

export default async function Image() {
  const navLabels = navigation.map((n) => n.label.toUpperCase()).join(' ');
  const text = `${profile.name} ${profile.title} ${profile.tagline} ${navLabels}`;

  const fontData = await loadGoogleFont('Space+Grotesk:wght@500;700', text);

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: 'hsl(222, 84%, 5%)',
        padding: '80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
              color: 'hsl(210, 40%, 96%)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {profile.name}
          </h1>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 500,
              fontFamily: 'Space Grotesk',
              color: 'hsl(210, 40%, 96%)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {profile.title}
          </h2>
          <p
            style={{
              fontSize: '24px',
              fontFamily: 'Space Grotesk',
              color: 'hsl(215, 20%, 65%)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {profile.tagline}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          {navigation.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '1px',
                  backgroundColor: 'hsl(215, 20%, 65%)',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk',
                  color: 'hsl(215, 20%, 65%)',
                  letterSpacing: '0.1em',
                }}
              >
                {item.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Space Grotesk',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );
}
