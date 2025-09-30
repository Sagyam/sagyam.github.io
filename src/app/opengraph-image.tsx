import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sagyam Thapa | Cloud & DevOps Engineer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const spaceGroteskBold = await fetch(
    new URL('https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUXsjNsFjTDJK.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const spaceGroteskMedium = await fetch(
    new URL('https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj62UXsjNsFjTDJK.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
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
              Sagyam Thapa
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
              Cloud & DevOps Engineer
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
              I build and automate robust, scalable cloud infrastructure.
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
            {['ABOUT', 'EXPERIENCE', 'WRITING', 'PROJECTS', 'CERTIFICATIONS'].map(
              (item) => (
                <div
                  key={item}
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
                    {item}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Space Grotesk',
          data: spaceGroteskBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Space Grotesk',
          data: spaceGroteskMedium,
          weight: 500,
          style: 'normal',
        },
      ],
    }
  );
}