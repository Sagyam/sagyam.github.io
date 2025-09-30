import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sagyam Thapa | Cloud & DevOps Engineer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
          backgroundColor: '#0a192f',
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
                color: '#ffffff',
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
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Cloud & DevOps Engineer
            </h2>
            <p
              style={{
                fontSize: '24px',
                color: '#94a3b8',
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
                      backgroundColor: '#94a3b8',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#94a3b8',
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
    }
  );
}