import './globals.css';

export const metadata = {
  title: 'AI Spend Audit',
  description: 'Analyze and optimize your AI tool spending',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
