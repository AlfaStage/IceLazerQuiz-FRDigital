
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getWhitelabelConfig } from '@/lib/whitelabel.server';
import { hexToHslString } from '@/lib/whitelabel';
import TrackingScriptsWrapper from '@/components/TrackingScriptsWrapper'; 
import { ClientOnlyToaster } from '@/components/ClientOnlyToaster';

export async function generateMetadata(): Promise<Metadata> {
  const whitelabelConfig = await getWhitelabelConfig();
  const metadataResult: Metadata = {
    title: whitelabelConfig.projectName || 'Sistema de Quiz Interativo',
    description: `Quiz interativo para qualificação de leads para ${whitelabelConfig.projectName || 'seu projeto'}.`,
  };

  if (whitelabelConfig.facebookDomainVerification && whitelabelConfig.facebookDomainVerification.trim() !== "") {
    metadataResult.other = {
      ...(metadataResult.other || {}),
      'facebook-domain-verification': whitelabelConfig.facebookDomainVerification.trim(),
    };
  }

  return metadataResult;
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whitelabelConfig = await getWhitelabelConfig();

  const themePrimaryColorHslString = whitelabelConfig.primaryColorHex ? hexToHslString(whitelabelConfig.primaryColorHex) : null;
  const secondaryColorHslString = whitelabelConfig.secondaryColorHex ? hexToHslString(whitelabelConfig.secondaryColorHex) : null;
  const pageBackgroundColorHslString = whitelabelConfig.pageBackgroundColorHex ? hexToHslString(whitelabelConfig.pageBackgroundColorHex) : null;
  const quizBackgroundColorHslString = whitelabelConfig.quizBackgroundColorHex ? hexToHslString(whitelabelConfig.quizBackgroundColorHex) : null;

  let buttonSpecificPrimaryHslString: string | null = null;
  if (whitelabelConfig.buttonPrimaryBgColorHex && whitelabelConfig.buttonPrimaryBgColorHex.trim() !== "") {
    buttonSpecificPrimaryHslString = hexToHslString(whitelabelConfig.buttonPrimaryBgColorHex);
  }

  const finalPrimaryInteractiveHsl = buttonSpecificPrimaryHslString || themePrimaryColorHslString;

  const accentColorHslString = secondaryColorHslString; 

  const dynamicStyles = `
    :root {
      ${pageBackgroundColorHslString ? `--background: ${pageBackgroundColorHslString};` : ''}
      ${quizBackgroundColorHslString ? `--card: ${quizBackgroundColorHslString};` : ''}
      ${finalPrimaryInteractiveHsl ? `--primary: ${finalPrimaryInteractiveHsl};` : ''}
      ${secondaryColorHslString ? `--secondary: ${secondaryColorHslString};` : ''}
      ${accentColorHslString ? `--accent: ${accentColorHslString};` : ''}

      ${themePrimaryColorHslString ? `--ring: ${themePrimaryColorHslString};` : ''}
      ${themePrimaryColorHslString ? `--chart-1: ${themePrimaryColorHslString};` : ''}
    }
  `;

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      </head>
      <body className="font-body antialiased">
        {children}
        <ClientOnlyToaster />
        <TrackingScriptsWrapper
          facebookPixelId={whitelabelConfig.facebookPixelId}
          facebookPixelIdSecondary={whitelabelConfig.facebookPixelIdSecondary}
          googleAnalyticsId={whitelabelConfig.googleAnalyticsId}
        />
      </body>
    </html>
  );
}
