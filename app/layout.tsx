import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Task Tracker",
  description: "Create, track, filter and search your tasks.",
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
